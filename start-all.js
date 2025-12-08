#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}╔═══════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  🚀 Starting Backend & Mobile App    ║${colors.reset}`);
console.log(`${colors.cyan}╚═══════════════════════════════════════╝${colors.reset}\n`);

const processes = [];

// Function to spawn a process with colored output
function startProcess(name, command, args, cwd, color, prefix) {
  console.log(`${color}📡 Starting ${name}...${colors.reset}`);
  
  const proc = spawn(command, args, {
    cwd: cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  // Color code output
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${prefix}]${colors.reset} ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${colors.yellow}[${prefix}]${colors.reset} ${line}`);
      }
    });
  });

  proc.on('error', (error) => {
    console.error(`${colors.red}❌ Error starting ${name}:${colors.reset}`, error);
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${colors.red}❌ ${name} exited with code ${code}${colors.reset}`);
    }
  });

  return proc;
}

// Start Backend
console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
const backend = startProcess(
  'Backend Server',
  'npm',
  ['run', 'dev'],
  __dirname,
  colors.green,
  'BACKEND'
);
processes.push(backend);
console.log(`${colors.green}✅ Backend starting on http://localhost:3000${colors.reset}\n`);

// Wait a moment before starting Expo
setTimeout(() => {
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  const expo = startProcess(
    'Expo App',
    'npx',
    ['expo', 'start', '--ios', '--localhost'],
    path.join(__dirname, 'AirbnbReferralApp'),
    colors.blue,
    'EXPO'
  );
  processes.push(expo);
  console.log(`${colors.blue}✅ Expo starting...${colors.reset}\n`);
  
  console.log(`${colors.cyan}✨ Both services are running!${colors.reset}`);
  console.log(`${colors.yellow}Press Ctrl+C to stop both services${colors.reset}\n`);
}, 2000);

// Handle cleanup
const cleanup = () => {
  console.log(`\n${colors.yellow}🛑 Stopping all services...${colors.reset}`);
  processes.forEach(proc => {
    try {
      proc.kill('SIGTERM');
    } catch (e) {
      // Ignore errors
    }
  });
  setTimeout(() => {
    processes.forEach(proc => {
      try {
        proc.kill('SIGKILL');
      } catch (e) {
        // Ignore errors
      }
    });
    process.exit(0);
  }, 2000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

