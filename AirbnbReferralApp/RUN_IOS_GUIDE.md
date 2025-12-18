# How to Run iOS App - Fixed Guide

## ❌ The Error You're Seeing

```
CommandError: No development build (com.airbnbreferral.app) for this project is installed.
```

This happens when you use `expo run:ios` which requires a **development build** (custom native build).

---

## ✅ Solution: Use Expo Go (Easiest Method)

### Method 1: Using Expo Start (Recommended)

1. **Start Expo:**
   ```bash
   cd AirbnbReferralApp
   npx expo start --localhost
   ```

2. **When you see the QR code and menu, press `i`**
   - This will open in iOS Simulator using **Expo Go**
   - No development build needed!

3. **Or use the web interface:**
   - Press `w` to open in web browser
   - Then click "Open in iOS Simulator"

---

### Method 2: Direct iOS Simulator Launch

```bash
cd AirbnbReferralApp
npx expo start --ios --localhost
```

This automatically opens iOS Simulator with Expo Go.

---

## 🔧 If You Need a Development Build

If you specifically need a development build (for custom native code):

### Step 1: Install Development Build on Simulator

```bash
cd AirbnbReferralApp
npx expo run:ios
```

**First time:** This will:
- Build the native iOS app
- Install it on the simulator
- Take 5-10 minutes

**Subsequent times:** It will be faster since the build is cached.

---

### Step 2: Start Expo with Development Build

```bash
npx expo start --dev-client
```

Then press `i` to open in the simulator.

---

## 📱 Quick Comparison

| Method | Command | Speed | Use Case |
|--------|---------|-------|----------|
| **Expo Go** | `npx expo start` then press `i` | ⚡ Fast | Development, testing |
| **Development Build** | `npx expo run:ios` | 🐌 Slow (first time) | Custom native code |

---

## 🚀 Recommended Workflow

### For Development (Use This!)

```bash
# Terminal 1: Start Backend
cd "/Users/mac/Desktop/wire frame"
npm run dev

# Terminal 2: Start Expo
cd "/Users/mac/Desktop/wire frame/AirbnbReferralApp"
npx expo start --localhost

# Then press 'i' when Expo menu appears
```

---

## 🐛 Troubleshooting

### iOS Simulator Not Opening

1. **Check if Xcode is installed:**
   ```bash
   xcode-select -p
   ```

2. **Install Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```

3. **List available simulators:**
   ```bash
   xcrun simctl list devices available
   ```

4. **Open specific simulator:**
   ```bash
   open -a Simulator
   ```

### Expo Go Not Installing

1. **Install Expo Go manually:**
   - Open App Store on simulator
   - Search "Expo Go"
   - Install it

2. **Or use web version:**
   - Press `w` in Expo terminal
   - Opens in browser (works without Expo Go)

---

## 💡 Pro Tips

1. **Use Expo Go for development** - Much faster!
2. **Only use development build** if you have custom native code
3. **Keep both terminals open** - Backend + Expo
4. **Press `r` in Expo terminal** to reload app
5. **Press `m` to toggle menu**

---

## ✅ Quick Fix for Your Current Issue

**Right now, do this:**

```bash
# Stop current Expo (Ctrl+C if running)

# Start Expo with iOS flag
cd "/Users/mac/Desktop/wire frame/AirbnbReferralApp"
npx expo start --ios --localhost
```

This will:
- Start Expo Metro bundler
- Automatically open iOS Simulator
- Use Expo Go (no development build needed)

---

**That's it! Your app should now open in iOS Simulator! 🎉**


