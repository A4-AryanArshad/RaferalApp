# Frontend-Backend Connection Status

## ✅ Connection Status: FULLY CONNECTED

Both the web frontend and mobile app are connected to the backend API.

---

## 🌐 Web Frontend (React) Connection

### API Configuration
- **Base URL:** `http://localhost:3000/api`
- **Location:** `frontend/src/services/api.ts`
- **Proxy:** Vite dev server proxies `/api` requests to backend

### Features Connected:
✅ **Authentication**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

✅ **Referrals**
- `POST /api/referrals/generate` - Create referral link
- `GET /api/referrals/:id` - Get referral by ID
- `GET /api/referrals/user/:userId` - Get user referrals
- `GET /api/referrals/stats` - Get referral statistics
- `POST /api/referrals/track-click` - Track click
- `POST /api/referrals/track-view` - Track view
- `POST /api/referrals/track-booking` - Track booking

### Token Management:
- ✅ JWT tokens stored in `localStorage`
- ✅ Automatic token injection in request headers
- ✅ 401 error handling with auto-redirect to login
- ✅ Token refresh support ready

### How It Works:
1. User logs in → Token saved to localStorage
2. All API requests automatically include: `Authorization: Bearer <token>`
3. Backend validates token on protected routes
4. On 401 error → User redirected to login

---

## 📱 Mobile App (React Native) Connection

### API Configuration
- **Base URL:** `http://localhost:3000/api`
- **Location:** `mobile/src/services/api.ts`
- **Note:** For physical devices, change to your computer's IP address

### Features Connected:
✅ **Authentication**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

✅ **Referrals**
- `POST /api/referrals/generate` - Create referral link
- `GET /api/referrals/:id` - Get referral by ID
- `GET /api/referrals/user/:userId` - Get user referrals
- `GET /api/referrals/stats` - Get referral statistics
- `POST /api/referrals/track-click` - Track click

### Token Management:
- ✅ JWT tokens stored in `AsyncStorage`
- ✅ Automatic token injection in request headers
- ✅ 401 error handling
- ✅ Async token retrieval

### How It Works:
1. User logs in → Token saved to AsyncStorage
2. All API requests automatically include: `Authorization: Bearer <token>`
3. Backend validates token on protected routes
4. On 401 error → Token cleared, user needs to re-login

---

## 🔧 Configuration

### Web Frontend
The web frontend uses Vite's proxy, so you can use relative URLs:
```typescript
// In frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

Or set via `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

### Mobile App
For **iOS Simulator**: Use `localhost` or `127.0.0.1`
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

For **Android Emulator**: Use `10.0.2.2` (special IP for host machine)
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

For **Physical Device**: Use your computer's IP address
```typescript
// Find your IP: ifconfig (Mac/Linux) or ipconfig (Windows)
const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
```

---

## 🧪 Testing the Connection

### 1. Start Backend
```bash
cd /Users/mac/Desktop/wire\ frame
npm run dev
```
Backend should be running on `http://localhost:3000`

### 2. Test Web Frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` and try:
- Register a new user
- Login
- View dashboard (should fetch stats from backend)

### 3. Test Mobile App
```bash
cd mobile
npm run ios  # or npm run android
```
Try:
- Register/Login
- Dashboard should show stats from backend

---

## 📊 API Endpoints Used

### User Endpoints
| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/api/users/register` | ✅ Connected |
| POST | `/api/users/login` | ✅ Connected |
| GET | `/api/users/profile` | ✅ Connected |
| PUT | `/api/users/profile` | ✅ Connected |

### Referral Endpoints
| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/api/referrals/generate` | ✅ Connected |
| GET | `/api/referrals/:id` | ✅ Connected |
| GET | `/api/referrals/user/:userId` | ✅ Connected |
| GET | `/api/referrals/stats` | ✅ Connected |
| POST | `/api/referrals/track-click` | ✅ Connected |
| POST | `/api/referrals/track-view` | ✅ Connected |
| POST | `/api/referrals/track-booking` | ✅ Connected |

---

## ✅ Summary

**Both frontends are fully connected and ready to use!**

- ✅ API services configured
- ✅ Authentication flow working
- ✅ Token management implemented
- ✅ Error handling in place
- ✅ All endpoints connected

Just make sure:
1. Backend is running on port 3000
2. MongoDB is connected
3. For mobile on physical device, update API_BASE_URL to your computer's IP



