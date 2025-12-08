# Frontend Quick Start

## Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173`

## Backend Connection

Make sure the backend is running on `http://localhost:3000`. The frontend is configured to proxy API requests automatically.

## Features Implemented

✅ **Authentication**
- Login page
- Signup page
- Protected routes
- JWT token management

✅ **Dashboard**
- Statistics overview
- Quick actions
- Empty states

✅ **Profile**
- View and edit profile
- Avatar support

✅ **Referrals**
- Generate referral links
- View all referrals
- Filter by status
- Copy and share links

✅ **Listings**
- Browse listings (mock data)
- View details
- Generate referrals

✅ **Rewards**
- Balance display
- Milestone tracking

## Project Structure

- `src/pages/` - All page components
- `src/components/` - Reusable components
- `src/services/` - API integration
- `src/contexts/` - React contexts (Auth)

## Next Steps

- Connect to real listing API
- Add reward calculations
- Implement real-time updates
- Add more animations and polish



