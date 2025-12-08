# Airbnb Referral Rewards App - Backend API

## Overview

This is the backend API for the Airbnb Referral Rewards App, built with Node.js, Express, TypeScript, and MongoDB. It provides user authentication, profile management, and a comprehensive referral tracking system.

## Features

### ✅ Milestone 2 - Core App Development

- **User Management**
  - User registration with email/password
  - User login with JWT authentication
  - Profile management (update name, phone, avatar)
  - User verification support

- **Referral System**
  - Unique referral code generation
  - Referral link creation and tracking
  - Click tracking with email capture
  - View tracking
  - Booking tracking and validation
  - Referral statistics

- **Database Integration**
  - MongoDB connection with Mongoose
  - Real-time data persistence
  - Optimized indexes for performance

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

## Project Structure

```
src/
├── config/
│   └── database.ts          # MongoDB connection
├── models/
│   ├── User.ts              # User model
│   ├── Referral.ts          # Referral model
│   ├── ReferralEmail.ts     # Referral email tracking
│   └── PendingConfirmation.ts # Booking confirmations
├── services/
│   ├── userService.ts       # User business logic
│   └── referralService.ts   # Referral business logic
├── routes/
│   ├── userRoutes.ts        # User API endpoints
│   └── referralRoutes.ts    # Referral API endpoints
├── middleware/
│   └── auth.ts              # JWT authentication middleware
├── utils/
│   ├── auth.ts              # JWT & password utilities
│   └── referralCode.ts      # Referral code generation
└── server.ts                # Express server setup
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
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

3. **Start MongoDB:**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### User Endpoints

#### Register User
```
POST /api/users/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890" (optional)
}
```

#### Login
```
POST /api/users/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```
GET /api/users/profile
Headers: Authorization: Bearer <access_token>
```

#### Update Profile (Protected)
```
PUT /api/users/profile
Headers: Authorization: Bearer <access_token>
Body: {
  "firstName": "John" (optional),
  "lastName": "Doe" (optional),
  "phone": "+1234567890" (optional),
  "avatarUrl": "https://..." (optional)
}
```

### Referral Endpoints

#### Generate Referral Link (Protected)
```
POST /api/referrals/generate
Headers: Authorization: Bearer <access_token>
Body: {
  "listingId": "507f1f77bcf86cd799439011" (optional),
  "baseUrl": "https://app.com" (optional)
}
```

#### Get Referral by ID (Protected)
```
GET /api/referrals/:id
Headers: Authorization: Bearer <access_token>
```

#### Get User Referrals (Protected)
```
GET /api/referrals/user/:userId?status=active
Headers: Authorization: Bearer <access_token>
Query Params: status (optional: active, booked, completed, expired)
```

#### Get Referral Statistics (Protected)
```
GET /api/referrals/stats
Headers: Authorization: Bearer <access_token>
```

#### Track Click (Public)
```
POST /api/referrals/track-click
Body: {
  "referralCode": "ABC12345",
  "email": "guest@example.com" (optional)
}
```

#### Track View (Public)
```
POST /api/referrals/track-view
Body: {
  "referralCode": "ABC12345"
}
```

#### Track Booking (Protected)
```
POST /api/referrals/track-booking
Headers: Authorization: Bearer <access_token>
Body: {
  "referralCode": "ABC12345",
  "guestEmail": "guest@example.com",
  "checkIn": "2024-01-15T00:00:00Z",
  "checkOut": "2024-01-20T00:00:00Z",
  "bookingConfirmation": "ABC123" (optional),
  "reportedBy": "guest" | "referrer"
}
```

## Database Schema

### Users Collection
- `email` (unique, indexed)
- `passwordHash`
- `firstName`, `lastName`
- `phone`, `avatarUrl`
- `ambassadorTier` (standard, premium, vip)
- `verifiedAt`
- `createdAt`, `updatedAt`

### Referrals Collection
- `userId` (reference to User)
- `listingId` (optional reference)
- `referralCode` (unique, indexed)
- `referralLink`
- `status` (active, booked, completed, expired)
- `clickCount`, `viewCount`
- `bookingValue`, `bookingDate`
- `checkInDate`, `checkOutDate`
- `createdAt`, `updatedAt`

### ReferralEmails Collection
- `email` (indexed)
- `referralCode` (indexed)
- `clickedAt`
- `createdAt`, `updatedAt`

### PendingConfirmations Collection
- `referralId` (reference to Referral)
- `referralCode` (indexed)
- `guestEmail`
- `bookingConfirmation`
- `bookingDates` (checkIn, checkOut)
- `reportedBy` (guest, referrer)
- `status` (pending_host_confirmation, host_confirmed, host_rejected)
- `hostConfirmedAt`
- `createdAt`, `updatedAt`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Access Token:** Short-lived (15 minutes by default)
2. **Refresh Token:** Long-lived (7 days by default)

Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Referral Code Generation

Referral codes are:
- 8-10 characters long
- Alphanumeric (uppercase)
- Unique (validated against database)
- Format: `ABC12345` (example)

## Error Handling

All errors follow a consistent format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Running in Development Mode
```bash
npm run dev
```
Uses `ts-node-dev` for hot-reloading.

### Building for Production
```bash
npm run build
npm start
```

## Next Steps

Future enhancements for Milestone 3+:
- Reward service integration
- Payment processing
- Email notifications
- Background job processing
- Redis caching
- API rate limiting
- Comprehensive error logging

## License

ISC



