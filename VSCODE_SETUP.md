# VS Code Setup Guide

This guide explains how to run the backend and mobile app directly from VS Code.

## Quick Start

### Option 1: Run Both Services Together (Recommended)

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: **"Tasks: Run Task"**
3. Select: **"Start Backend & Expo (Both)"**

This will start both the backend server and Expo app in separate terminal panels.

### Option 2: Run Services Individually

#### Start Backend Only:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: **"Tasks: Run Task"**
3. Select: **"Start Backend Server"**

#### Start Expo App Only:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: **"Tasks: Run Task"**
3. Select: **"Start Expo App"**

### Option 3: Use Debug Configurations

1. Go to the **Run and Debug** panel (⇧⌘D or `Ctrl+Shift+D`)
2. Select one of these configurations from the dropdown:
   - **"Debug Backend Server"** - Run backend with debugging
   - **"Start Expo (iOS)"** - Start Expo for iOS simulator
   - **"Start Expo (Android)"** - Start Expo for Android emulator
   - **"Start Backend & Expo (Both)"** - Run both together with debugging

3. Press `F5` or click the green play button

## Available Tasks

### Tasks (Ctrl+Shift+P → "Tasks: Run Task")

- **Start Backend Server** - Runs `npm run dev` in the root directory
- **Start Expo App** - Runs `npx expo start --ios --localhost` in AirbnbReferralApp
- **Start Backend & Expo (Both)** - Runs both services in parallel

### Debug Configurations (Run and Debug Panel)

- **Debug Backend Server** - Debug backend with breakpoints
- **Attach to Backend** - Attach debugger to running backend (requires `--inspect` flag)
- **Start Expo (iOS)** - Launch Expo for iOS
- **Start Expo (Android)** - Launch Expo for Android
- **Start Backend & Expo (Both)** - Compound configuration to run both

## Keyboard Shortcuts

You can create custom keyboard shortcuts:

1. Go to **File → Preferences → Keyboard Shortcuts** (or `Cmd+K Cmd+S`)
2. Search for "Tasks: Run Task"
3. Assign a shortcut (e.g., `Cmd+Shift+B` for backend, `Cmd+Shift+M` for mobile)

## Terminal Panels

When you run tasks, VS Code will open dedicated terminal panels:
- Each service runs in its own terminal
- You can see logs from both services simultaneously
- Terminals are labeled for easy identification

## Stopping Services

- Click the trash icon in the terminal panel
- Or use `Ctrl+C` in the terminal
- For compound launches, use the stop button in the Debug panel

## Troubleshooting

### Backend not starting?
- Check if port 3000 is already in use
- Verify MongoDB connection string in `.env`
- Check terminal output for errors

### Expo not starting?
- Make sure you're in the `AirbnbReferralApp` directory
- Check if iOS Simulator is installed
- Verify Node.js and npm are installed

### Can't see tasks?
- Make sure `.vscode/tasks.json` exists in the workspace root
- Reload VS Code window (`Cmd+Shift+P` → "Reload Window")

## Recommended VS Code Extensions

The workspace includes `.vscode/extensions.json` with recommended extensions:
- ESLint
- Prettier
- Expo Tools
- TypeScript

Install them by clicking the notification when opening the workspace, or manually from the Extensions panel.

