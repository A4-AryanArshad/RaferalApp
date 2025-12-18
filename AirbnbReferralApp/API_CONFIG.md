# API Configuration Guide

## Current Configuration

The app is currently configured to use **localhost** for local development.

**File:** `src/services/api.ts`

## API URLs by Environment

### Local Development (Current)
- **iOS Simulator:** `http://localhost:3000/api`
- **Android Emulator:** `http://10.0.2.2:3000/api` ⚠️ (Android emulator uses special IP)
- **Physical Device:** `http://<your-computer-ip>:3000/api` (e.g., `http://192.168.1.100:3000/api`)

### Production
- **Deployed Backend:** `https://raferal-app-pqbq.vercel.app/api`

## How to Change

### For Local Development (iOS Simulator)
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

### For Android Emulator
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

### For Physical Device
1. Find your computer's IP address:
   - **Mac/Linux:** `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows:** `ipconfig`
2. Update the URL:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:3000/api'; // Replace with your IP
   ```

### For Production
```typescript
const API_BASE_URL = 'https://raferal-app-pqbq.vercel.app/api';
```

## Testing Connection

Make sure the backend server is running:
```bash
# Check if backend is running
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "Airbnb Referral Rewards API"
}
```

## Troubleshooting

### Connection Refused
- Make sure backend server is running on port 3000
- Check firewall settings
- For Android emulator, use `10.0.2.2` instead of `localhost`

### Network Error on Physical Device
- Ensure phone and computer are on the same WiFi network
- Use computer's IP address, not `localhost`
- Check that backend allows connections from your network


