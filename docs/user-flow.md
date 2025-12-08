# User Flow Documentation

## Primary User Journeys

### 1. First-Time User Onboarding

```
1. Download & Install App
   ↓
2. Sign Up / Login
   - Email or Social Media (Google, Facebook, Apple)
   - Phone verification
   ↓
3. Welcome Screen
   - App introduction
   - How it works tutorial
   ↓
4. Dashboard (Empty State)
   - "Start recommending" CTA
   - Quick tutorial overlay
```

### 2. Referral Flow (Core Journey)

```
1. Dashboard
   - View current stats (referrals, rewards, progress)
   ↓
2. Browse Listings
   - Search or browse featured listings
   - Filter by location, price, dates
   ↓
3. Select Listing
   - View listing details
   - Photos, description, reviews, amenities
   ↓
4. Generate Referral Link
   - Tap "Recommend" button
   - Unique link generated instantly
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

### 3. Rewards Flow

```
1. Dashboard
   - View current rewards balance
   ↓
2. Rewards Screen
   - See breakdown:
     * Total earned
     * Pending rewards
     * Free nights unlocked
     * Progress to next milestone
   ↓
3. Withdraw Earnings
   - Link payment method (bank, PayPal, etc.)
   - Request withdrawal
   - View transaction history
```

### 4. Booking Confirmation Flow (Referrer Perspective)

```
1. Friend Books via Referral Link
   ↓
2. Notification Received
   - "Your referral just booked!"
   ↓
3. Reward Pending
   - Status: "Pending validation"
   - Wait for check-in completion
   ↓
4. Reward Validated
   - After successful stay
   - Status: "Reward available"
   - Added to balance
   ↓
5. Free Night Milestone Check
   - If 5th booking: Free night unlocked
   - Notification: "You've unlocked a free night!"
```

### 5. Profile & Settings Flow

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
4. Payment Settings
   - Add/remove payment methods
   - Set default withdrawal method
   ↓
5. Notifications
   - Configure notification preferences
   ↓
6. Help & Support
   - FAQ
   - Contact support
   - Terms & Privacy
```

## Screen Flow Diagram

```
┌─────────────┐
│   Splash    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Onboarding │
└──────┬──────┘
       │
       ↓
┌─────────────┐     ┌──────────────┐
│  Dashboard  │────▶│ Browse List. │
└──────┬──────┘     └──────┬───────┘
       │                   │
       │                   ↓
       │            ┌──────────────┐
       │            │Listing Detail│
       │            └──────┬───────┘
       │                   │
       │                   ↓
       │            ┌──────────────┐
       │            │ Generate Link│
       │            └──────┬───────┘
       │                   │
       │                   ↓
       │            ┌──────────────┐
       │            │ Share Refer. │
       │            └──────────────┘
       │
       ↓
┌─────────────┐
│   Rewards   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Profile   │
└─────────────┘
```

## Key Interactions

### Dashboard Interactions
- **Pull to refresh:** Update stats
- **Tap stat card:** Navigate to detailed view
- **Swipe referral cards:** Quick actions (share again, view details)
- **Tap CTA button:** Navigate to browse listings

### Listing Interactions
- **Swipe photos:** View gallery
- **Tap "Recommend":** Generate referral link
- **Long press listing:** Quick share menu
- **Swipe down:** Close detail view

### Sharing Interactions
- **Tap share method:** Open native share sheet
- **Copy link:** Show confirmation toast
- **Track link:** View analytics overlay

## Error States & Edge Cases

### Empty States
- No referrals yet: Show onboarding tips
- No rewards: Show "Start earning" message
- No listings found: Show search suggestions

### Error Handling
- Network error: Retry button
- Invalid referral link: Error message + regenerate option
- Payment failure: Clear error message + support contact

### Loading States
- Skeleton screens for listings
- Progress indicators for link generation
- Shimmer effects for stats loading


