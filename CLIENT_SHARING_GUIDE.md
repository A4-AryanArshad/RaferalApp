# How to Share App with Client for Testing

## Option 1: Expo Go App (Easiest - Recommended for Quick Testing)

### For You (Developer):
1. Start the app with tunnel mode (works from anywhere):
   ```bash
   cd AirbnbReferralApp
   npx expo start --tunnel
   ```

2. You'll get a QR code and a link like: `exp://exp.host/@your-username/AirbnbReferralApp`

3. Share this link or QR code with your client

### For Your Client:
1. **Install Expo Go** on their phone:
   - iOS: Download "Expo Go" from App Store
   - Android: Download "Expo Go" from Google Play Store

2. **Open Expo Go** and scan the QR code (or enter the link)

3. The app will load automatically!

**Pros:** ✅ Instant, no build needed, easy updates
**Cons:** ❌ Requires Expo Go app, needs internet connection

---

## Option 2: Development Build (APK/IPA Files)

### Build Android APK (For Android Devices)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   cd AirbnbReferralApp
   eas build:configure
   ```

4. **Build APK**:
   ```bash
   eas build --platform android --profile development
   ```

5. **Download the APK** when build completes and share with client

### Build iOS IPA (For iPhone/iPad)

1. **Build IPA**:
   ```bash
   eas build --platform ios --profile development
   ```

2. **Download the IPA** and share (client needs to install via TestFlight or direct install)

**Pros:** ✅ Standalone app, no Expo Go needed
**Cons:** ❌ Requires build time, needs Apple Developer account for iOS

---

## Option 3: Production Build (For App Store/Play Store)

### Android (AAB for Play Store)
```bash
eas build --platform android --profile production
```

### iOS (For App Store)
```bash
eas build --platform ios --profile production
```

---

## Quick Start: Share via Expo Go (Recommended)

### Step-by-Step:

1. **Start with tunnel**:
   ```bash
   cd "/Users/mac/Desktop/wire frame/AirbnbReferralApp"
   npx expo start --tunnel
   ```

2. **Share the QR code or link** with your client

3. **Client installs Expo Go** and scans QR code

4. **Done!** Client can test the app

---

## Important Notes:

### Backend Connection:
- If client is testing on their device, make sure:
  - Backend is running on your computer
  - Use tunnel mode OR
  - Update API URL in `AirbnbReferralApp/src/services/api.ts` to point to your public IP or server

### For Remote Testing:
Update the API URL to your server:
```typescript
const API_BASE_URL = 'https://your-server.com/api';
```

---

## Which Option Should You Use?

- **Quick Testing (Same Network)**: Expo Go with `--localhost`
- **Remote Testing**: Expo Go with `--tunnel` 
- **Standalone App**: Development build (APK/IPA)
- **Production Release**: Production build

