# How to Run Server in VS Code

## 🚀 Quick Start Methods

### Method 1: Using VS Code Terminal (Easiest)

1. **Open VS Code Terminal**
   - Press `` Ctrl + ` `` (backtick) or `Cmd + ` on Mac
   - Or go to: `Terminal` → `New Terminal`

2. **Run the server**
   ```bash
   npm run dev
   ```

3. **You should see:**
   ```
   🚀 Server running on port 3000
   📝 Environment: production
   🔗 Health check: http://localhost:3000/health
   ✅ MongoDB connected successfully
   ```

---

### Method 2: Using VS Code Debugger (Recommended)

1. **Open Run and Debug Panel**
   - Press `F5` or `Cmd + Shift + D`
   - Or click the "Run and Debug" icon in the sidebar

2. **Select Configuration**
   - Choose "Run Backend Server" from the dropdown
   - Click the green play button ▶️

3. **Benefits:**
   - ✅ Breakpoints work
   - ✅ Can debug and inspect variables
   - ✅ Auto-restart on file changes
   - ✅ Integrated terminal output

---

### Method 3: Using Tasks (Alternative)

1. **Open Command Palette**
   - Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux)

2. **Run Task**
   - Type: `Tasks: Run Task`
   - Select: `Start Backend Server`

---

## 📋 Available Scripts

### Development Mode (Auto-restart)
```bash
npm run dev
```
- Uses `ts-node-dev` for hot reload
- Restarts automatically on file changes
- Best for development

### Production Build
```bash
npm run build
```
- Compiles TypeScript to JavaScript
- Output in `dist/` folder

### Production Start
```bash
npm start
```
- Runs compiled JavaScript from `dist/`
- Use after building

---

## 🔧 VS Code Configuration Files

### `.vscode/launch.json`
- Debug configurations for running server
- Two options:
  - **Run Backend Server**: Simple run
  - **Debug Backend Server**: Full debugging with breakpoints

### `.vscode/tasks.json`
- Task definitions for common operations
- Can be run from Command Palette

---

## 🐛 Debugging Tips

### Setting Breakpoints
1. Click in the gutter (left of line numbers) to set a breakpoint
2. Red dot appears
3. Run with "Debug Backend Server" configuration
4. Execution will pause at breakpoints

### Debug Console
- View variables
- Evaluate expressions
- Inspect call stack

### Watch Variables
- Add variables to "Watch" panel
- Monitor values as code executes

---

## 📝 Terminal Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| New Terminal | `Cmd + ` | `Ctrl + ` |
| Split Terminal | `Cmd + \` | `Ctrl + \` |
| Kill Terminal | `Cmd + Shift + K` | `Ctrl + Shift + K` |

---

## ✅ Verify Server is Running

### Check Health Endpoint
```bash
curl http://localhost:3000/health
```

### Expected Response
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T...",
  "service": "Airbnb Referral Rewards API"
}
```

### Check in Browser
Open: `http://localhost:3000/health`

---

## 🔍 Troubleshooting

### Port Already in Use
If you see `EADDRINUSE: address already in use :::3000`:

1. **Find process using port 3000:**
   ```bash
   lsof -ti:3000
   ```

2. **Kill the process:**
   ```bash
   kill -9 $(lsof -ti:3000)
   ```

3. **Or change port in `src/server.ts`**

### MongoDB Connection Error
- Check MongoDB connection string in `src/config/database.ts`
- Ensure MongoDB is accessible
- Check network/firewall settings

### TypeScript Errors
- Run: `npm run build` to check for errors
- Check `tsconfig.json` configuration

---

## 🎯 Recommended Workflow

1. **Open VS Code** in project root
2. **Open Terminal** (`Cmd + ` `)
3. **Run:** `npm run dev`
4. **Keep terminal open** to see logs
5. **Make changes** - server auto-restarts
6. **Test API** at `http://localhost:3000/api`

---

## 📚 Additional Resources

- **VS Code Debugging:** https://code.visualstudio.com/docs/nodejs/nodejs-debugging
- **Node.js in VS Code:** https://code.visualstudio.com/docs/nodejs/nodejs-tutorial

---

## 💡 Pro Tips

1. **Use Integrated Terminal** - Keeps everything in VS Code
2. **Set up Auto-save** - File → Auto Save (for faster development)
3. **Install Extensions:**
   - ESLint
   - Prettier
   - REST Client (for testing API)
4. **Use Debug Console** - Great for testing code snippets
5. **Multiple Terminals** - Split terminal for server + other commands

---

**Happy Coding! 🚀**


