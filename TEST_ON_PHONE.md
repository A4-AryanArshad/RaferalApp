# Testing App on Physical Phone

## Quick Start

### Step 1: Start Expo with Tunnel
```bash
cd AirbnbReferralApp
npx expo start --tunnel
```

### Step 2: Install Expo Go on Your Phone
- **iOS**: Download "Expo Go" from App Store
- **Android**: Download "Expo Go" from Google Play Store

### Step 3: Connect
- Open Expo Go app
- Scan the QR code from terminal
- App will load automatically

## Important Notes

### ✅ Backend is Already Deployed
- Backend is on Vercel: `https://raferal-app-pqbq.vercel.app`
- Mobile app is already configured to use this backend
- No need to keep your computer's backend running

### 🔄 Tunnel Mode
- `--tunnel` creates a public URL that works from anywhere
- Each time you restart, you get a new URL
- The old URL will show "offline" error (that's normal)

### 📱 If You See "Offline" Error
1. Stop Expo (Ctrl+C)
2. Restart with: `npx expo start --tunnel`
3. Scan the NEW QR code
4. The old QR code won't work anymore

## Alternative: Development Build (Standalone App)

If you want a standalone app (no Expo Go needed):

```bash
# Build APK for Android
eas build --platform android --profile preview

# Build IPA for iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

## Troubleshooting

### Error: "Endpoint is offline"
- Solution: Restart Expo with `--tunnel` flag
- Always use the latest QR code

### Error: "Network Error"
- Check: Backend is deployed on Vercel (it is!)
- Check: Phone has internet connection
- The app should work - backend is always online

### App loads but API calls fail
- Backend URL is already set to Vercel
- Should work automatically
- Check Vercel logs if issues persist






