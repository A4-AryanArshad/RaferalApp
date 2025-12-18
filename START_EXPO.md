# How to Start Expo/Mobile App

## Quick Start

### Method 1: Terminal (Recommended)

1. **Open Terminal in VS Code**
   - Press `` Cmd + ` `` (backtick)
   - Or: Terminal → New Terminal

2. **Navigate to mobile app directory**
   ```bash
   cd AirbnbReferralApp
   ```

3. **Start Expo**
   ```bash
   npx expo start --localhost
   ```

4. **You should see:**
   - QR code in terminal
   - Options to press:
     - `i` - Open iOS simulator
     - `a` - Open Android emulator
     - `w` - Open in web browser
     - `r` - Reload app

---

### Method 2: Using npm script

```bash
cd AirbnbReferralApp
npm start
```

---

### Method 3: VS Code Task

1. Press `Cmd + Shift + P`
2. Type: `Tasks: Run Task`
3. Select: `Start Expo App`

---

## Troubleshooting

### Port 8081 Already in Use

If you see "Port 8081 is already in use":

1. **Kill the process:**
   ```bash
   lsof -ti:8081 | xargs kill -9
   ```

2. **Or use a different port:**
   ```bash
   npx expo start --localhost --port 8082
   ```

### Expo Not Starting

1. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

2. **Reinstall dependencies:**
   ```bash
   cd AirbnbReferralApp
   rm -rf node_modules
   npm install
   ```

3. **Check Node version:**
   ```bash
   node --version  # Should be 18+ or 20+
   ```

### Metro Bundler Not Responding

1. **Check if it's running:**
   ```bash
   lsof -ti:8081
   ```

2. **Restart Expo:**
   ```bash
   # Kill existing process
   lsof -ti:8081 | xargs kill -9
   
   # Start fresh
   npx expo start --localhost --clear
   ```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npx expo start` | Start Expo (default) |
| `npx expo start --localhost` | Start with localhost (for local backend) |
| `npx expo start --clear` | Clear cache and start |
| `npx expo start --ios` | Start and open iOS simulator |
| `npx expo start --android` | Start and open Android emulator |
| `npx expo start --web` | Start and open in web browser |

---

## Verify It's Running

### Check Port
```bash
lsof -ti:8081
```
Should return a process ID if running.

### Check Metro Status
```bash
curl http://localhost:8081/status
```

### Open in Browser
Open: `http://localhost:8081`

---

## Next Steps

Once Expo is running:

1. **On iOS Simulator:**
   - Press `i` in the Expo terminal
   - Or scan QR code with Expo Go app

2. **On Android Emulator:**
   - Press `a` in the Expo terminal
   - Or scan QR code with Expo Go app

3. **On Physical Device:**
   - Install Expo Go app
   - Scan QR code from terminal
   - Make sure device and computer are on same WiFi

---

## Important Notes

- **Backend must be running** on `http://localhost:3000` for API calls to work
- **Use `--localhost` flag** to ensure app connects to local backend
- **Keep terminal open** - closing it stops Expo
- **Press `r` in Expo terminal** to reload app after code changes


