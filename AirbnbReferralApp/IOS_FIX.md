# iOS Simulator Fix - Quick Solution

## ❌ The Problem

When you run `expo start --ios`, you get:
```
CommandError: No development build (com.airbnbreferral.app) for this project is installed.
```

This happens because `--ios` flag tries to use a **development build**, which requires building native code first.

---

## ✅ Solution: Use Expo Go Instead

### Step 1: Start Expo (Without --ios flag)

```bash
cd AirbnbReferralApp
npx expo start --localhost
```

### Step 2: Open iOS Simulator Manually

**Option A: From Terminal (After Expo Starts)**
1. Wait for Expo to start (you'll see QR code)
2. Press `i` in the Expo terminal
3. iOS Simulator will open with Expo Go

**Option B: Open Simulator First**
1. Open iOS Simulator manually:
   ```bash
   open -a Simulator
   ```
2. Start Expo:
   ```bash
   npx expo start --localhost
   ```
3. When QR code appears, press `i` or scan it

**Option C: Use Web Interface**
1. Start Expo:
   ```bash
   npx expo start --localhost
   ```
2. Press `w` to open in web browser
3. Click "Open in iOS Simulator" button

---

## 🔧 Alternative: Build Development Client (If Needed)

If you specifically need a development build (for custom native code):

### Step 1: Build Development Client

```bash
cd AirbnbReferralApp
npx expo run:ios
```

**⚠️ Warning:** This takes 5-10 minutes the first time!

### Step 2: Start Expo with Dev Client

```bash
npx expo start --dev-client --localhost
```

Then press `i` to open.

---

## 📋 Quick Commands

| What You Want | Command |
|---------------|---------|
| **Start Expo (Expo Go)** | `npx expo start --localhost` |
| **Open iOS Simulator** | Press `i` after Expo starts |
| **Open Web Version** | Press `w` after Expo starts |
| **Build Dev Client** | `npx expo run:ios` (slow!) |

---

## 🎯 Recommended Workflow

```bash
# Terminal 1: Backend
cd "/Users/mac/Desktop/wire frame"
npm run dev

# Terminal 2: Expo
cd "/Users/mac/Desktop/wire frame/AirbnbReferralApp"
npx expo start --localhost

# When Expo menu appears, press 'i' for iOS
```

---

## ✅ What Should Happen

1. ✅ Expo Metro bundler starts
2. ✅ QR code appears in terminal
3. ✅ You press `i`
4. ✅ iOS Simulator opens
5. ✅ Expo Go app loads (or installs automatically)
6. ✅ Your app appears in simulator

---

## 🐛 Troubleshooting

### Simulator Not Opening

```bash
# Check if Xcode is installed
xcode-select -p

# Install Xcode Command Line Tools if needed
xcode-select --install

# Open Simulator manually
open -a Simulator
```

### Expo Go Not Installing

1. Open App Store in Simulator
2. Search "Expo Go"
3. Install it
4. Then scan QR code or press `i` again

### Still Getting Development Build Error?

Make sure you're using:
```bash
npx expo start --localhost
```

**NOT:**
```bash
npx expo start --ios  # ❌ This requires dev build
```

---

## 💡 Pro Tip

**For development, always use Expo Go** - it's much faster and doesn't require building native code!

Only use development builds if you have custom native modules.

---

**Now try: `npx expo start --localhost` and press `i` when ready! 🚀**


