# 🚀 How to Run App in VS Code - Complete Guide

## Quick Start Methods

### Method 1: Run Both Services Together (Easiest) ⭐

1. **Open Command Palette**
   - Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux)

2. **Run Task**
   - Type: `Tasks: Run Task`
   - Select: **"Start Backend & Expo (Both)"**

3. **That's it!** Both services will start in separate terminal panels.

---

### Method 2: Run Services Individually

#### Start Backend Only:

**Option A: Using Tasks**
1. Press `Cmd + Shift + P`
2. Type: `Tasks: Run Task`
3. Select: **"Start Backend Server"**

**Option B: Using Debugger**
1. Press `F5` or `Cmd + Shift + D`
2. Select: **"Run Backend Server"**
3. Click green play button ▶️

**Option C: Using Terminal**
1. Press `` Cmd + ` `` (backtick) to open terminal
2. Run: `npm run dev`

---

#### Start Expo/Mobile App Only:

**Option A: Using Tasks**
1. Press `Cmd + Shift + P`
2. Type: `Tasks: Run Task`
3. Select: **"Start Expo App"**

**Option B: Using Terminal**
1. Press `` Cmd + ` `` to open terminal
2. Run:
   ```bash
   cd AirbnbReferralApp
   npx expo start --localhost
   ```

---

## 📋 Available Tasks

Access via: `Cmd + Shift + P` → `Tasks: Run Task`

| Task Name | What It Does |
|-----------|--------------|
| **Start Backend Server** | Runs `npm run dev` in root directory |
| **Start Expo App** | Runs `npx expo start --localhost` in AirbnbReferralApp |
| **Start Backend & Expo (Both)** | Runs both services in parallel |
| **Build Backend** | Compiles TypeScript to JavaScript |

---

## 🐛 Debug Configurations

Access via: `F5` or `Cmd + Shift + D` → Select from dropdown

| Configuration | What It Does |
|---------------|--------------|
| **Run Backend Server** | Runs backend with auto-restart |
| **Debug Backend Server** | Runs backend with breakpoints enabled |
| **Start Backend & Expo (Both)** | Compound: Runs backend + starts Expo task |

---

## 🎯 Recommended Workflow

### For Development:

1. **Start Both Services:**
   - `Cmd + Shift + P` → `Tasks: Run Task` → `Start Backend & Expo (Both)`

2. **You'll see:**
   - Terminal 1: Backend server (port 3000)
   - Terminal 2: Expo Metro bundler (port 8081)

3. **Open iOS Simulator:**
   - In Expo terminal, press `i`
   - Or open Simulator manually and use Expo Go

---

## ⌨️ Keyboard Shortcuts (Optional Setup)

You can create custom shortcuts:

1. **Go to:** `File → Preferences → Keyboard Shortcuts` (or `Cmd + K Cmd + S`)

2. **Search for:** `Tasks: Run Task`

3. **Add shortcuts:**
   - `Cmd + Shift + B` → Start Backend
   - `Cmd + Shift + M` → Start Mobile App
   - `Cmd + Shift + A` → Start Both

---

## 📱 After Starting Expo

Once Expo is running:

1. **Open iOS Simulator:**
   - Press `i` in Expo terminal
   - Or: `open -a Simulator` then connect manually

2. **Open Android Emulator:**
   - Press `a` in Expo terminal

3. **Open Web Browser:**
   - Press `w` in Expo terminal

4. **Reload App:**
   - Press `r` in Expo terminal

---

## 🔍 Terminal Panels

When you run tasks, VS Code opens dedicated terminal panels:

- **Each service runs in its own terminal**
- **You can see logs from both simultaneously**
- **Terminals are labeled for easy identification**
- **Click terminal tab to focus on specific service**

---

## 🛑 Stopping Services

### Stop Individual Service:
- Click trash icon in terminal panel
- Or press `Ctrl + C` in that terminal

### Stop All Services:
- Close terminal panels
- Or use `Cmd + Shift + P` → `Tasks: Terminate Task`

---

## ✅ Verify Everything is Running

### Check Backend:
```bash
curl http://localhost:3000/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "Airbnb Referral Rewards API"
}
```

### Check Expo:
- Open: `http://localhost:8081`
- Should see Expo DevTools

---

## 🐛 Troubleshooting

### Backend Not Starting?

1. **Check if port 3000 is in use:**
   ```bash
   lsof -ti:3000
   ```

2. **Kill process if needed:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

3. **Check MongoDB connection** in `src/config/database.ts`

### Expo Not Starting?

1. **Check if port 8081 is in use:**
   ```bash
   lsof -ti:8081
   ```

2. **Kill process if needed:**
   ```bash
   lsof -ti:8081 | xargs kill -9
   ```

3. **Clear Expo cache:**
   ```bash
   cd AirbnbReferralApp
   npx expo start --localhost --clear
   ```

### Can't See Tasks?

1. **Reload VS Code window:**
   - `Cmd + Shift + P` → `Developer: Reload Window`

2. **Check `.vscode/tasks.json` exists**

3. **Restart VS Code**

---

## 💡 Pro Tips

1. **Use Integrated Terminal** - Keeps everything in VS Code
2. **Split Terminal** - `Cmd + \` to see both services side-by-side
3. **Auto-save** - Enable in `File → Auto Save` for faster development
4. **Terminal Groups** - VS Code groups related terminals together
5. **Watch Mode** - Backend auto-restarts on file changes
6. **Hot Reload** - Expo auto-reloads on code changes

---

## 📚 File Locations

- **Tasks Config:** `.vscode/tasks.json`
- **Debug Config:** `.vscode/launch.json`
- **Settings:** `.vscode/settings.json`

---

## 🎉 Summary

**Easiest way to run everything:**

1. `Cmd + Shift + P`
2. `Tasks: Run Task`
3. `Start Backend & Expo (Both)`
4. Press `i` in Expo terminal to open iOS Simulator

**That's it! Your app is running! 🚀**

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────┐
│  VS Code Run Commands                   │
├─────────────────────────────────────────┤
│  Start Both:                            │
│  Cmd+Shift+P → Tasks → Both            │
│                                         │
│  Start Backend:                         │
│  Cmd+Shift+P → Tasks → Backend        │
│  OR F5 → Run Backend Server            │
│                                         │
│  Start Expo:                            │
│  Cmd+Shift+P → Tasks → Expo           │
│                                         │
│  Open Terminal:                         │
│  Cmd + ` (backtick)                    │
└─────────────────────────────────────────┘
```

---

**Happy Coding! 🎯**


