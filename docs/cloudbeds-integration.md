# Cloudbeds API Integration Guide

## What is Cloudbeds?

Cloudbeds is a **Property Management System (PMS)** used by hotels, hostels, and vacation rentals to manage:
- Bookings
- Availability
- Pricing
- Guest information
- Payments

**Key Point:** Cloudbeds has a **public API** that you can use to build your referral app!

---

## Why Cloudbeds is Perfect for Your App

### ✅ Advantages:
1. **Official API** - Legal and supported
2. **Real Properties** - Thousands of hotels/vacation rentals use it
3. **Booking Tracking** - Automatic webhooks when bookings happen
4. **Property Data** - Get all listing details, photos, prices
5. **Availability** - Real-time room availability
6. **Revenue Data** - Track booking values for commission calculation

### ⚠️ Considerations:
- Only works with properties that use Cloudbeds
- Need to partner with properties or Cloudbeds
- API access requires approval/credentials

---

## Cloudbeds API Overview

### Main API Endpoints You'll Use:

#### 1. **Get Properties**
```
GET /properties
```
- List all available properties
- Get property details (name, address, photos)
- Get property settings

#### 2. **Get Property Details**
```
GET /properties/{property_id}
```
- Detailed property information
- Photos, amenities, descriptions
- Location data

#### 3. **Get Availability**
```
GET /properties/{property_id}/availability
```
- Check room availability
- Date ranges
- Room types available

#### 4. **Get Rates/Pricing**
```
GET /properties/{property_id}/rates
```
- Current pricing
- Seasonal rates
- Room type prices

#### 5. **Create Booking**
```
POST /bookings
```
- Create new booking
- Include referral code in booking notes
- Link booking to referrer

#### 6. **Get Bookings**
```
GET /bookings
```
- List all bookings
- Filter by referral code
- Get booking status

#### 7. **Webhooks** (Most Important!)
```
POST /webhooks
```
- Receive notifications when bookings are created
- Track booking confirmations
- Update referral status automatically

---

## How to Get Cloudbeds API Access

### Step 1: Sign Up
1. Go to **developers.cloudbeds.com**
2. Create developer account
3. Register your application

### Step 2: Get API Credentials
1. Request API access
2. Get **API Key** and **API Secret**
3. Set up OAuth if needed

### Step 3: Partner with Properties
- Contact properties using Cloudbeds
- Get permission to access their data
- Or partner with Cloudbeds directly

### Step 4: Test API
- Use Cloudbeds API sandbox
- Test endpoints
- Verify webhook setup

---

## Integration Flow for Your App

### 1. Fetch Properties from Cloudbeds

```javascript
// Example: Get all properties
async function getProperties() {
  const response = await fetch('https://api.cloudbeds.com/api/v1.2/properties', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  const properties = await response.json();
  return properties;
}
```

### 2. Display Properties in Your App

```javascript
// Show properties to users
properties.forEach(property => {
  // Display:
  // - Property name
  // - Photos (from Cloudbeds)
  // - Location
  // - Price (from rates API)
  // - Availability
});
```

### 3. Generate Referral Link

```javascript
// When user clicks "Recommend"
function generateReferralLink(propertyId, userId) {
  const referralCode = generateUniqueCode(); // e.g., "abc123"
  
  // Save to database
  saveReferral({
    userId: userId,
    propertyId: propertyId,
    referralCode: referralCode,
    createdAt: new Date()
  });
  
  // Return link
  return `yourapp.com/r/${referralCode}?property=${propertyId}`;
}
```

### 4. Track Booking with Referral Code

```javascript
// When friend books through your link
async function createBooking(propertyId, referralCode, bookingData) {
  const booking = await fetch('https://api.cloudbeds.com/api/v1.2/bookings', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      property_id: propertyId,
      ...bookingData,
      notes: `Referral Code: ${referralCode}` // Include referral code
    })
  });
  
  return booking;
}
```

### 5. Receive Booking Webhook

```javascript
// Webhook endpoint in your backend
app.post('/webhooks/cloudbeds', async (req, res) => {
  const booking = req.body;
  
  // Check if booking has referral code
  const referralCode = extractReferralCode(booking.notes);
  
  if (referralCode) {
    // Find referrer
    const referral = await findReferralByCode(referralCode);
    
    if (referral) {
      // Calculate reward
      const reward = calculateReward(booking.total_amount);
      
      // Create reward record
      await createReward({
        userId: referral.userId,
        bookingId: booking.id,
        amount: reward,
        status: 'pending'
      });
      
      // Notify user
      sendNotification(referral.userId, 'New booking from your referral!');
    }
  }
  
  res.status(200).send('OK');
});
```

---

## Cloudbeds API Authentication

### Option 1: API Key (Simpler)
```javascript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
```

### Option 2: OAuth 2.0 (More Secure)
```javascript
// Get access token first
const token = await getOAuthToken();
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## Important API Endpoints for Referral App

### 1. **Properties Endpoint**
- **URL:** `GET /api/v1.2/properties`
- **Use:** Get list of all properties to show in app
- **Frequency:** Cache and refresh daily

### 2. **Property Details**
- **URL:** `GET /api/v1.2/properties/{id}`
- **Use:** Show detailed property page
- **Frequency:** On-demand when user views property

### 3. **Availability**
- **URL:** `GET /api/v1.2/properties/{id}/availability`
- **Use:** Show available dates and rooms
- **Frequency:** Real-time when user searches

### 4. **Rates**
- **URL:** `GET /api/v1.2/properties/{id}/rates`
- **Use:** Show pricing for dates
- **Frequency:** Real-time when user selects dates

### 5. **Bookings Webhook**
- **URL:** `POST /your-server/webhooks/cloudbeds`
- **Use:** Receive booking notifications
- **Frequency:** Real-time when booking happens

---

## Setting Up Webhooks

### 1. Register Webhook URL
```javascript
// Register your webhook endpoint
POST https://api.cloudbeds.com/api/v1.2/webhooks
{
  "url": "https://yourapp.com/webhooks/cloudbeds",
  "events": ["booking.created", "booking.confirmed"]
}
```

### 2. Handle Webhook Events
```javascript
// Your webhook handler
app.post('/webhooks/cloudbeds', (req, res) => {
  const event = req.body;
  
  switch(event.type) {
    case 'booking.created':
      handleNewBooking(event.data);
      break;
    case 'booking.confirmed':
      handleConfirmedBooking(event.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## Commission/Reward Calculation

### Example Flow:

1. **Booking Created** → Webhook received
2. **Check Referral Code** → Extract from booking notes
3. **Find Referrer** → Look up user by referral code
4. **Calculate Reward**:
   ```javascript
   const bookingValue = booking.total_amount; // e.g., $500
   const commissionRate = 0.10; // 10%
   const reward = bookingValue * commissionRate; // $50
   ```
5. **Create Reward Record** → Save to database
6. **Validate Booking** → Wait for check-in/check-out
7. **Pay Reward** → Use Stripe to send money

---

## Cloudbeds API Documentation

### Official Resources:
- **API Docs:** developers.cloudbeds.com/api-documentation
- **Getting Started:** developers.cloudbeds.com/getting-started
- **Webhook Guide:** developers.cloudbeds.com/webhooks
- **Support:** support.cloudbeds.com

### API Version:
- Current: **v1.2**
- Base URL: `https://api.cloudbeds.com/api/v1.2`

---

## Cost Considerations

### Cloudbeds API:
- **API Access:** Usually FREE (depends on partnership)
- **Rate Limits:** Check with Cloudbeds
- **Property Access:** Need permission from properties

### Your Costs:
- **API Calls:** Usually included in partnership
- **Webhook Processing:** Your server costs
- **Data Storage:** Firebase/Database costs

---

## Implementation Steps

### Phase 1: Setup (Week 1-2)
1. ✅ Sign up for Cloudbeds Developer account
2. ✅ Get API credentials
3. ✅ Set up authentication
4. ✅ Test API connection

### Phase 2: Property Integration (Week 3-4)
1. ✅ Fetch properties from API
2. ✅ Display in your app
3. ✅ Show property details
4. ✅ Display availability and rates

### Phase 3: Referral System (Week 5-6)
1. ✅ Generate referral codes
2. ✅ Create referral links
3. ✅ Track clicks
4. ✅ Include referral code in bookings

### Phase 4: Booking Tracking (Week 7-8)
1. ✅ Set up webhooks
2. ✅ Receive booking notifications
3. ✅ Match bookings to referrals
4. ✅ Calculate rewards

### Phase 5: Reward System (Week 9-10)
1. ✅ Create reward records
2. ✅ Validate bookings
3. ✅ Process payments
4. ✅ Send notifications

---

## Example Code Structure

```
your-app/
├── services/
│   ├── cloudbeds.js          # Cloudbeds API client
│   ├── referrals.js          # Referral logic
│   └── rewards.js            # Reward calculation
├── webhooks/
│   └── cloudbeds.js          # Webhook handler
├── api/
│   ├── properties.js          # Property endpoints
│   └── bookings.js            # Booking endpoints
└── database/
    ├── referrals.js           # Referral storage
    └── rewards.js             # Reward storage
```

---

## Testing Strategy

### 1. **Sandbox Environment**
- Use Cloudbeds test/sandbox API
- Test with sample properties
- Verify webhook delivery

### 2. **Test Scenarios**
- ✅ Fetch properties
- ✅ Generate referral link
- ✅ Create test booking
- ✅ Receive webhook
- ✅ Calculate reward
- ✅ Process payment

### 3. **Production Testing**
- Start with 1-2 properties
- Monitor API calls
- Check webhook delivery
- Verify reward calculations

---

## Common Challenges & Solutions

### Challenge 1: API Rate Limits
**Solution:** Cache property data, refresh periodically

### Challenge 2: Webhook Reliability
**Solution:** Implement retry logic, log all events

### Challenge 3: Property Access
**Solution:** Partner with properties, get permissions

### Challenge 4: Booking Attribution
**Solution:** Always include referral code in booking notes

---

## Next Steps

1. **Contact Cloudbeds** - Get API access
2. **Read Documentation** - Understand API structure
3. **Set up Test Account** - Start with sandbox
4. **Build Integration** - Start with property fetching
5. **Test Webhooks** - Verify booking tracking
6. **Go Live** - Launch with real properties

---

## Summary

✅ **Cloudbeds API is perfect for your referral app!**

- Official, legal API
- Automatic booking tracking
- Real property data
- Webhook support
- Well-documented

**This solves the Airbnb API problem completely!**


