# Airbnb Referral Rewards App - Complete Workflow Guide

## 📱 App Overview

**Airbnb Referral Rewards App** is a mobile application that enables travelers to recommend Airbnb listings to friends and earn financial rewards or free nights when their recommendations lead to bookings.

### Value Proposition

**For Travelers (Referrers):**
- Browse and discover Airbnb listings
- Generate unique referral links for any listing
- Share links via WhatsApp, Email, SMS, or Social Media
- Earn money when friends book through your link
- Unlock free nights after reaching milestones (e.g., 5 bookings)
- Track referrals, clicks, and rewards in real-time

**For Hosts:**
- Access to word-of-mouth marketing channel
- Pay-per-performance model (only pay when booking occurs)
- Higher quality referrals from trusted sources

---

## 👥 User Roles

### 1. **Guest/Referrer** (Primary User)
- Travelers who browse listings and share referral links
- Earn rewards when their referrals lead to bookings

### 2. **Host** (Secondary User)
- Property owners who list their properties
- Confirm bookings and validate referrals
- Pay commissions when bookings are confirmed

---

## 🎯 Complete User Workflows

### Workflow 1: First-Time User Onboarding

ick tutorial overlay
```

**Screens:**
- **Login Screen** (`LoginScreen.tsx`)
- **Signup Screen** (`SignupScreen.tsx`)
- **Dashboard Screen** (`DashboardScreen.tsx`)

---

### Workflow 2: Core Referral Flow (Main Journey)

```
1. Dashboard
   - View current stats (referrals, clicks, bookings, completed)
   - See featured listings
   ↓
2. Browse Listings
   - Search or browse featured listings
   - Filter by location, price, dates
   - View listing cards with images
   ↓
3. Select Listing
   - View listing details
   - Photos, description, amenities
   - Price and availability
   ↓
4. Generate Referral Link
   - Tap "Recommend" or "Share" button
   - Unique referral code generated instantly
   - Link created: yourapp.com/r/XYZ789
   ↓
5. Share Referral
   - Choose sharing method:
     * WhatsApp
     * Email
     * SMS
     * Copy link
     * Social media (Facebook, Twitter, Instagram)
   ↓
6. Track Referral
   - View in "My Referrals" section
   - See status: Sent, Viewed, Booked, Completed
  
```

**Screens:**
- **Dashboard Screen** (`DashboardScreen.tsx`)
- **Listing Search Screen** (`ListingSearchScreen.tsx`)
- **Listing Detail Screen** (`ListingDetailScreen.tsx`)
- **Referral Share Screen** (`ReferralShareScreen.tsx`)
- **Referrals Screen** (`ReferralsScreen.tsx`)

---

### Workflow 3: Booking Confirmation Flow

```
1. Friend Clicks Referral Link
   - System captures email (optional)
   - Stores referral code
   - Redirects to Airbnb listing
   ↓
2. Friend Books on Airbnb
   - Gets booking confirmation number
   - Receives confirmation email from Airbnb
   ↓
3. Report Booking (Guest or Referrer)
   - Guest or Referrer reports booking:
     * Guest email
     * Booking confirmation number
     * Booking dates
   ↓
4. Host Gets Notification
   - Email/SMS/In-app notification
   - "New booking to confirm" message
   ↓
5. Host Confirms Booking
   - Host logs into app
   - Views pending confirmations
   - Verifies booking in Airbnb account
   - Clicks "Confirm" button
   ↓
6. Reward Created
   - System calculates reward amount
   - Creates pending reward record
   - Notifies referrer
   ↓
7. Reward Validated (After Check-in)
   - System validates booking completed
   - Updates reward status to "validated"
   - Adds to referrer's balance
```

**Screens:**
- **Referral Landing Screen** (`ReferralLandingScreen.tsx`) - When friend clicks link
- **Report Booking Screen** (`ReportBookingScreen.tsx`) - For guest/referrer
- **Host Confirmations Screen** (Admin/Host view)

---

### Workflow 4: Rewards & Milestones

```
1. Dashboard
   - View current rewards balance
   - See progress to milestones
   ↓
2. Rewards Screen
   - See breakdown:
     * Total earned
     * Pending rewards
     * Free nights unlocked
     * Progress to next milestone (e.g., 5 bookings = free night)
   ↓
3. Transaction History
   - View all reward transactions
   - See status: Pending, Validated, Paid
   ↓
4. Withdraw Earnings (Future)
   - Link payment method (bank, PayPal, etc.)
   - Request withdrawal
   - View transaction history
```

**Screens:**
- **Rewards Screen** (`RewardsScreen.tsx`)

---

### Workflow 5: Profile & Settings

```
1. Profile Tab
   ↓
2. View Statistics
   - Total referrals
   - Total earnings
   - Ambassador tier
   ↓
3. Edit Profile
   - Name, email, phone
   - Profile photo
   ↓
4. Payment Settings (Future)
   - Add/remove payment methods
   - Set default withdrawal method
   ↓
5. Notifications (Future)
   - Configure notification preferences
   ↓
6. Help & Support (Future)
   - FAQ
   - Contact support
   - Terms & Privacy
```

**Screens:**
- **Profile Screen** (`ProfileScreen.tsx`)

---

### Workflow 6: Host Workflow (Create Listing)

```
1. Host Dashboard
   ↓
2. Create Listing
   - Property name
   - Description
   - Location
   - Photos (upload multiple)
   - Price
   - Amenities
   ↓
3. Submit Listing
   - Listing created
   - Available for referrals
   ↓
4. View Listings
   - See all your listings
   - View referral stats per listing
   ↓
5. Confirm Bookings
   - View pending confirmations
   - Verify bookings in Airbnb
   - Confirm or reject
```

**Screens:**
- **Create Listing Screen** (`CreateListingScreen.tsx`)
- **Host Dashboard** (Admin/Host view)

---

## 📱 App Screens & Features

### Authentication Screens
1. **Login Screen**
   - Email and password login
   - "Forgot password" link (future)
   - "Sign up" navigation

2. **Signup Screen**
   - Email, password, first name, last name
   - Phone number (optional)
   - Terms & conditions acceptance

### Main App Screens

3. **Dashboard Screen**
   - Welcome message with user's name
   - Statistics cards:
     * Total Referrals
     * Total Clicks
     * Booked Referrals
     * Completed Referrals
   - Featured listings carousel
   - Quick actions:
     * "Browse all listings" button
     * "My referrals" button
   - Empty state for new users

4. **Listing Search Screen**
   - Search bar
   - Filter options (location, price, dates)
   - Grid/list view of listings
   - Listing cards with:
     * Thumbnail image
     * Title
     * Location
     * Price
   - Pull to refresh

5. **Listing Detail Screen**
   - Image gallery (swipeable)
   - Listing title and location
   - Price per night
   - Description
   - Amenities list
   - "Recommend" / "Share" button
   - "View on Airbnb" button (external link)

6. **Referral Share Screen**
   - Generated referral link
   - QR code (optional)
   - Share options:
     * WhatsApp
     * Email
     * SMS
     * Copy link
     * Social media
   - Share statistics (clicks, views)

7. **Referrals Screen**
   - List of all user's referrals
   - Each referral shows:
     * Listing image and title
     * Referral code
     * Status (Sent, Viewed, Booked, Completed)
     * Date created
     * Clicks count
   - Filter by status
   - Pull to refresh

8. **Rewards Screen**
   - Current balance
   - Pending rewards
   - Free nights unlocked
   - Milestone progress bar
   - Transaction history
   - Empty state for no rewards

9. **Profile Screen**
   - User information:
     * Profile photo
     * Name
     * Email
     * Phone
   - Statistics:
     * Total referrals
     * Total earnings
     * Ambassador tier
   - Edit profile button
   - Logout button

10. **Create Listing Screen** (Host)
    - Form fields:
      * Property name
      * Description
      * Location (address)
      * Price per night
      * Amenities (checkboxes)
    - Image upload (multiple photos)
    - Submit button

11. **Referral Landing Screen**
    - Shown when friend clicks referral link
    - Listing preview
    - "Continue to Airbnb" button
    - Email capture (optional)

12. **Report Booking Screen**
    - Form for guest/referrer to report booking:
      * Guest email
      * Booking confirmation number
      * Booking dates
    - Submit button

---

## 🔧 Technical Architecture

### Backend (Node.js + Express + MongoDB)
- **API Base URL:** `https://raferal-app-pqbq.vercel.app/api`
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Vercel (Serverless)

### Frontend (React Native + Expo)
- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Bottom Tabs)
- **State Management:** React Context + AsyncStorage
- **API Client:** Axios
- **Platforms:** iOS and Android

### Key Features
- ✅ User authentication (Login/Signup)
- ✅ JWT token management
- ✅ Referral code generation
- ✅ Referral tracking (clicks, views)
- ✅ Listing management (CRUD)
- ✅ Image upload (Base64)
- ✅ Statistics dashboard
- ✅ Real-time data fetching
- ✅ Error handling
- ✅ Network timeout handling (60 seconds)

---

## 📊 Data Flow

### Referral Tracking Flow
```
User generates referral link
  ↓
Link stored in database with:
  - User ID
  - Listing ID
  - Unique referral code
  - Timestamp
  ↓
Friend clicks link
  ↓
System tracks:
  - Click timestamp
  - IP address (optional)
  - User agent
  ↓
Friend books on Airbnb
  ↓
Guest/Referrer reports booking
  ↓
Host confirms booking
  ↓
Reward created and validated
```

### Statistics Flow
```
Dashboard loads
  ↓
Fetch user statistics:
  - Total referrals count
  - Active referrals count
  - Booked referrals count
  - Completed referrals count
  - Total clicks
  - Total views
  ↓
Display in cards
  ↓
Pull to refresh updates data
```

---

## 🧪 Testing Instructions

### For Client Testing

#### 1. **Installation**
- Download Expo Go app on iOS or Android device
- Scan QR code from development server
- App will load automatically

#### 2. **Test Account Creation**
1. Open app
2. Tap "Sign up"
3. Enter:
   - Email: `test@example.com`
   - Password: `Test123!`
   - First name: `Test`
   - Last name: `User`
4. Tap "Sign up"
5. Should redirect to Dashboard

#### 3. **Test Referral Flow**
1. From Dashboard, tap "Browse all listings"
2. Select a listing
3. Tap "Recommend" or "Share"
4. Choose sharing method (e.g., "Copy link")
5. Link should be copied to clipboard
6. Go to "My Referrals" tab to see the referral

#### 4. **Test Listing Creation (Host)**
1. Navigate to Create Listing (if available)
2. Fill in:
   - Property name
   - Description
   - Location
   - Price
3. Upload at least one photo
4. Tap "Submit"
5. Listing should appear in search

#### 5. **Test Statistics**
1. Go to Dashboard
2. Verify statistics cards show:
   - Total Referrals
   - Total Clicks
   - Booked Referrals
   - Completed Referrals
3. Pull down to refresh
4. Statistics should update

#### 6. **Test Profile**
1. Go to Profile tab
2. Verify user information displays correctly
3. Tap "Edit Profile" (if available)
4. Update information
5. Save changes

#### 7. **Test Rewards**
1. Go to Rewards tab
2. Verify balance displays (should be 0.00 for new user)
3. Check milestone progress
4. View transaction history (should be empty for new user)

---

## ⚠️ Known Issues & Limitations

### Current Limitations
1. **Booking Detection:** Manual reporting required (Airbnb doesn't provide API)
2. **Image Upload:** Limited to 4.5MB per image (Vercel serverless limit)
3. **Payment Processing:** Not yet implemented (future feature)
4. **Push Notifications:** Not yet implemented (future feature)
5. **Email Notifications:** Not yet implemented (future feature)

### Known Issues
1. **Timeout Errors:** May occur on slow networks (timeout set to 60 seconds)
2. **Image Loading:** Some images may fail to load (fallback placeholder shown)
3. **Cold Starts:** Vercel serverless functions may have cold start delays (first request after inactivity)

---

## 🚀 Deployment Status

### Backend
- ✅ **Deployed:** Vercel
- ✅ **URL:** `https://raferal-app-pqbq.vercel.app/api`
- ✅ **Database:** MongoDB Atlas (connected)
- ✅ **Status:** Production-ready

### Frontend (Mobile App)
- ✅ **Development:** React Native + Expo
- ✅ **Status:** Ready for testing
- ⏳ **Production Build:** Can be built with EAS Build (requires Expo account)

---

## 📝 Next Steps for Production

### Phase 1: Core Features (Current)
- ✅ User authentication
- ✅ Referral generation
- ✅ Listing management
- ✅ Statistics tracking
- ✅ Image upload

### Phase 2: Booking Flow (In Progress)
- ⏳ Booking reporting
- ⏳ Host confirmation
- ⏳ Reward calculation
- ⏳ Reward validation

### Phase 3: Payment & Notifications (Future)
- ⏳ Payment integration (Stripe/PayPal)
- ⏳ Push notifications
- ⏳ Email notifications
- ⏳ SMS notifications

### Phase 4: Advanced Features (Future)
- ⏳ Social media integration
- ⏳ Referral analytics dashboard
- ⏳ Ambassador tiers
- ⏳ Referral leaderboard

---

## 📞 Support & Contact

### For Technical Issues
- Check network connection
- Restart Expo app
- Clear app cache
- Check backend status: `https://raferal-app-pqbq.vercel.app/health`

### For Feature Requests
- Document feature requirements
- Discuss with development team
- Prioritize based on business needs

---

## 📄 Document Version

**Version:** 1.0  
**Last Updated:** December 9, 2025  
**Status:** Ready for Client Review

---

## 🎯 Summary

This app enables travelers to:
1. **Discover** Airbnb listings
2. **Share** referral links with friends
3. **Track** referral performance
4. **Earn** rewards when bookings occur
5. **Monitor** statistics and milestones

The app is **fully functional** for:
- User registration and login
- Browsing and searching listings
- Creating and sharing referral links
- Tracking referrals and statistics
- Viewing rewards and milestones
- Managing profile

**Ready for client testing and feedback!**



