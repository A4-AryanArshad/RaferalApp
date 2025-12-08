# Airbnb Referral Rewards App

## Project Overview

A mobile application that enables Airbnb travelers to recommend listings to friends and earn financial rewards or free nights when their recommendations lead to bookings. This addresses the gap in word-of-mouth marketing channels for hosts while rewarding travelers for their influence.

## Project Structure

```
wire frame/
├── README.md (this file)
├── README-BACKEND.md (backend API documentation)
├── README-FRONTEND.md (frontend quick start)
├── QUICKSTART.md (quick setup guide)
├── package.json (backend dependencies)
├── tsconfig.json (TypeScript configuration)
├── src/ (backend source code)
│   ├── config/ (database configuration)
│   ├── models/ (MongoDB models)
│   ├── services/ (business logic)
│   ├── routes/ (API routes)
│   ├── middleware/ (auth middleware)
│   ├── utils/ (utilities)
│   └── server.ts (Express server)
├── frontend/ (React web frontend)
│   ├── src/
│   │   ├── pages/ (page components)
│   │   ├── components/ (reusable components)
│   │   ├── services/ (API integration)
│   │   ├── contexts/ (React contexts)
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── mobile/ (React Native mobile app)
│   ├── src/
│   │   ├── screens/ (screen components)
│   │   ├── navigation/ (React Navigation)
│   │   ├── services/ (API integration)
│   │   ├── contexts/ (React contexts)
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── app-concept.md
│   ├── user-flow.md
│   ├── system-requirements.md
│   └── technical-architecture.md
└── wireframes/
    ├── index.html (navigation hub)
    ├── dashboard.html (referral dashboard)
    ├── listing-search.html (browse listings)
    ├── listing-detail.html (listing details)
    ├── referral-share.html (share referral)
    ├── rewards.html (rewards & progress)
    └── profile.html (user profile)
```

## Milestones

### ✅ Milestone 1 - Product Design & Technical Architecture
- App concept and user flow documentation
- Wireframes for Android & iOS
- Technical architecture (backend structure, database schema, payment flow, referral logic)
- System requirements

### ✅ Milestone 2 - Core App Development (User & Referral System)
- **Backend API:**
  - User Management: Registration, login, and profile management
  - Referral System: Unique code generation, referral tracking, and validation logic
  - Database Integration: MongoDB connection with real-time data persistence
  - Authentication: JWT-based secure authentication
  - API Endpoints: Complete REST API for users and referrals
- **Web Frontend (React):**
  - React + TypeScript web application
  - Authentication UI (Login/Signup)
  - Dashboard with statistics
  - Profile management
  - Referral generation and sharing
  - Listing browser (with mock data)
  - Responsive design with modern UI
- **Mobile App (React Native):**
  - React Native + TypeScript mobile application
  - iOS and Android support
  - React Navigation setup
  - Authentication screens (Login/Signup)
  - Dashboard with statistics
  - Bottom tab navigation
  - API integration with AsyncStorage
  - Foundation for all core screens

## Quick Start

### Backend Setup

See `QUICKSTART.md` for detailed setup instructions.

**Quick commands:**
```bash
# Install dependencies
npm install

# Set up .env file (see QUICKSTART.md)
# Start MongoDB

# Run development server
npm run dev
```

### Web Frontend Setup

See `README-FRONTEND.md` for web frontend setup.

**Quick commands:**
```bash
cd frontend
npm install
npm run dev
```

The web frontend will run on `http://localhost:5173` and connect to the backend at `http://localhost:3000`.

### Mobile App Setup

See `mobile/README.md` and `mobile/SETUP.md` for React Native setup.

**Quick commands:**
```bash
cd mobile
npm install

# iOS (macOS only)
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

**Note:** The mobile app requires:
- React Native development environment
- Xcode (for iOS)
- Android Studio (for Android)
- Backend API URL configuration in `src/services/api.ts`

## Documentation

- **Backend API:** See `README-BACKEND.md` for complete API documentation
- **Web Frontend:** See `README-FRONTEND.md` for React web app details
- **Mobile App:** See `mobile/README.md` for React Native app details
- **Quick Start:** See `QUICKSTART.md` for backend setup instructions
- **Mobile Setup:** See `mobile/SETUP.md` for React Native setup guide
- **Architecture:** See `docs/technical-architecture.md` for system design

## How to View Wireframes

Open `wireframes/index.html` in a web browser to navigate through all wireframe screens.


