# Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/airbnb-referral-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 4. Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 3000
📝 Environment: development
🔗 Health check: http://localhost:3000/health
```

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Generate Referral Link (use accessToken from login response):**
```bash
curl -X POST http://localhost:3000/api/referrals/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "listingId": "507f1f77bcf86cd799439011"
  }'
```

## Testing with Postman

1. Import the following collection structure:

**Base URL:** `http://localhost:3000`

**Endpoints:**
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile` (requires auth)
- `PUT /api/users/profile` (requires auth)
- `POST /api/referrals/generate` (requires auth)
- `GET /api/referrals/stats` (requires auth)
- `POST /api/referrals/track-click` (public)

2. For protected endpoints, add the access token:
   - Go to Authorization tab
   - Select "Bearer Token"
   - Paste the token from login response

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 3000

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Use the same secret for token generation and verification

## Next Steps

- Review `README-BACKEND.md` for detailed API documentation
- Check `docs/technical-architecture.md` for system design
- Explore the API endpoints using Postman or curl



