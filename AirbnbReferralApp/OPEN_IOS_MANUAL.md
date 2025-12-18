# How to Open iOS Simulator - Manual Method

## ⚠️ The Issue

Because `expo-dev-client` is installed, pressing `i` tries to use a development build instead of Expo Go.

## ✅ Solution: Manual Method

### Step 1: Open iOS Simulator Manually

```bash
open -a Simulator
```

Or:
- Open Spotlight (Cmd + Space)
- Type "Simulator"
- Press Enter

### Step 2: Install Expo Go in Simulator

1. **In the Simulator**, open Safari
2. Go to: `https://apps.apple.com/app/expo-go/id982107779`
3. Click "View in App Store"
4. Install Expo Go

**OR** use App Store directly:
1. Open App Store in Simulator
2. Search "Expo Go"
3. Install it

### Step 3: Connect to Your Expo Server

1. **Make sure Expo is running:**
   ```bash
   cd AirbnbReferralApp
   npx expo start --localhost
   ```

2. **In Expo terminal, you'll see a QR code**

3. **In iOS Simulator:**
   - Open Expo Go app
   - Tap "Enter URL manually"
   - Enter: `exp://localhost:8081`
   - Or scan the QR code (if simulator supports it)

---

## 🔧 Alternative: Use Web Version

### Option 1: Press 'w' in Expo Terminal

When Expo is running:
1. Press `w` in the Expo terminal
2. Browser opens
3. Click "Open in iOS Simulator" button

### Option 2: Open Directly in Browser

1. Start Expo:
   ```bash
   npx expo start --localhost
   ```

2. Open browser: `http://localhost:8081`

3. You'll see the Expo DevTools interface

---

## 🚀 Quick Fix: Remove Dev Client (Temporary)

If you want to use Expo Go easily, temporarily remove dev client:

```bash
cd AirbnbReferralApp
npm uninstall expo-dev-client
```

Then:
```bash
npx expo start --localhost
```

Press `i` - it should work with Expo Go now!

**Note:** You can reinstall it later if needed:
```bash
npm install expo-dev-client@~6.0.20
```

---

## 📱 Recommended: Build Dev Client Once

If you want to keep dev client, build it once:

```bash
cd AirbnbReferralApp
npx expo run:ios
```

**⚠️ This takes 5-10 minutes the first time!**

After it's built:
```bash
npx expo start --dev-client --localhost
```

Then press `i` - it will work!

---

## ✅ Current Status

Right now:
1. ✅ Expo is running on `http://localhost:8081`
2. ✅ iOS Simulator should be open (or open it manually)
3. ✅ Install Expo Go in Simulator
4. ✅ Open Expo Go and connect to `exp://localhost:8081`

---

## 💡 Pro Tip

**For fastest development:**
1. Remove `expo-dev-client` temporarily
2. Use Expo Go
3. Reinstall dev client only when you need custom native code


