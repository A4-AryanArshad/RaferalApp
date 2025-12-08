# Technical Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Applications                    │
│  ┌──────────────┐              ┌──────────────┐         │
│  │   iOS App    │              │ Android App  │         │
│  └──────┬───────┘              └──────┬───────┘         │
└─────────┼──────────────────────────────┼─────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
          ┌──────────────▼──────────────┐
          │      API Gateway            │
          │  (Authentication, Routing)  │
          └──────────────┬──────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
┌─────────▼─────────┐      ┌───────────▼──────────┐
│   API Services    │      │   Background Jobs    │
│                   │      │                      │
│ - User Service    │      │ - Reward Validation  │
│ - Listing Service │      │ - Payment Processing │
│ - Referral Service│      │ - Notification Queue │
│ - Reward Service  │      │ - Analytics ETL      │
│ - Payment Service │      └──────────────────────┘
└─────────┬─────────┘
          │
┌─────────▼─────────────────────────────────────┐
│              Data Layer                        │
│  ┌──────────┐  ┌──────────┐                  │
│  │ MongoDB  │  │  Redis   │                  │
│  │(Primary) │  │ (Cache)  │                  │
│  └──────────┘  └──────────┘                  │
└───────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────┐
│         External Services                      │
│  - Payment Gateways (Stripe, PayPal)          │
│  - Email (NodeMailer + SMTP provider)         │
└───────────────────────────────────────────────┘
```

## Backend Architecture

### Microservices Structure

#### 1. User Service
- **Responsibility:** User authentication, profile management
- **Tech Stack:** Node.js/Express
- **Database:** MongoDB (`users` collection)
- **Endpoints:**
  - `POST /api/users/register`
  - `POST /api/users/login`
  - `GET /api/users/profile`
  - `PUT /api/users/profile`
  - `POST /api/users/reset-password`

#### 2. Listing Service
- **Responsibility:** Store and manage properties that **hosts add directly into our app** (no Airbnb API dependency)
- **Tech Stack:** Node.js/Express
- **Database:** MongoDB (`listings` collection), Redis (cache)
- **Endpoints:**
  - `GET /api/listings/search`
  - `GET /api/listings/:id`
  - `GET /api/listings/featured`
  - `POST /api/listings/favorites`

#### 3. Referral Service
- **Responsibility:** Generate and track referral links
- **Tech Stack:** Node.js/Express
- **Database:** MongoDB (`referrals`, `referralEmails`, `pendingConfirmations` collections)
- **Endpoints:**
  - `POST /api/referrals/generate`
  - `GET /api/referrals/:id`
  - `GET /api/referrals/user/:userId`
  - `POST /api/referrals/track-click`
  - `POST /api/referrals/track-booking`

#### 4. Reward Service
- **Responsibility:** Calculate and manage rewards
- **Tech Stack:** Node.js/Express
- **Database:** MongoDB (`rewards`, `userMilestones` collections)
- **Endpoints:**
  - `GET /api/rewards/balance`
  - `GET /api/rewards/history`
  - `POST /api/rewards/validate`
  - `GET /api/rewards/milestones`

#### 5. Payment Service
- **Responsibility:** Process payments and withdrawals
- **Tech Stack:** Node.js/Express
- **Database:** MongoDB (`transactions` collection)
- **Endpoints:**
  - `POST /api/payments/methods`
  - `GET /api/payments/methods`
  - `POST /api/payments/withdraw`
  - `GET /api/payments/transactions`

### API Gateway
- **Technology:** Kong, AWS API Gateway, or custom
- **Functions:**
  - Authentication/Authorization (JWT validation)
  - Rate limiting
  - Request routing
  - Request/Response transformation
  - Logging and monitoring

## Database Schema

### MongoDB (Primary Database)

Below are example document shapes for the main collections. All documents include
`createdAt` / `updatedAt` timestamps (omitted here for brevity).

#### `users` Collection
```javascript
{
  _id: ObjectId,
  email: String,           // unique
  phone: String,
  passwordHash: String,
  firstName: String,
  lastName: String,
  avatarUrl: String,
  ambassadorTier: "standard" | "premium" | "vip",
  verifiedAt: ISODate | null
}
```

#### `listings` Collection
```javascript
{
  _id: ObjectId,
  airbnbListingId: String, // original Airbnb ID
  title: String,
  description: String,
  location: {
    city: String,
    country: String,
    address: String
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  pricePerNight: Number,
  currency: String,        // e.g. "EUR"
  images: [String],
  amenities: [String],
  hostId: ObjectId,        // reference to hosts collection (optional)
  rating: Number,
  reviewCount: Number
}
```

#### `referrals` Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // referrer
  listingId: ObjectId,
  referralCode: String,    // unique short code, e.g. "XYZ789"
  referralLink: String,    // https://app.com/r/XYZ789
  status: "active" | "booked" | "completed" | "expired",
  clickCount: Number,
  viewCount: Number,
  bookingValue: Number | null,
  bookingDate: ISODate | null,
  checkInDate: ISODate | null,
  checkOutDate: ISODate | null
}
```

#### `referralEmails` Collection
```javascript
{
  _id: ObjectId,
  email: String,           // guest email captured at click time
  referralCode: String,    // links back to referrals.referralCode
  clickedAt: ISODate
}
```

#### `pendingConfirmations` Collection
```javascript
{
  _id: ObjectId,
  referralId: ObjectId,
  referralCode: String,
  guestEmail: String,
  bookingConfirmation: String,   // Airbnb confirmation code (optional)
  bookingDates: {
    checkIn: ISODate,
    checkOut: ISODate
  },
  reportedBy: "guest" | "referrer",
  status: "pending_host_confirmation" | "host_confirmed" | "host_rejected",
  hostConfirmedAt: ISODate | null
}
```

#### `rewards` Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  referralId: ObjectId | null,
  type: "cash" | "free_night" | "bonus",
  amount: Number,
  currency: String,
  status: "pending" | "validated" | "paid" | "cancelled",
  validatedAt: ISODate | null,
  paidAt: ISODate | null,
  transactionId: ObjectId | null
}
```

#### `transactions` Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "withdrawal" | "deposit" | "refund",
  amount: Number,
  currency: String,
  paymentMethodId: String,
  paymentProvider: "stripe" | "paypal",
  providerTransactionId: String,
  status: "pending" | "processing" | "completed" | "failed",
  failureReason: String | null
}
```

#### `userMilestones` Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  milestoneType: "free_night" | "ambassador_upgrade",
  milestoneValue: Number,      // e.g. 5 bookings
  currentProgress: Number,
  achievedAt: ISODate | null,
  rewardId: ObjectId | null
}
```

### Redis (Caching)
- **Use Cases:**
  - Session storage
  - Listing search results (TTL: 1 hour)
  - User referral stats (TTL: 5 minutes)
  - Rate limiting counters

### MongoDB (Analytics / Events)
```javascript
{
  _id: ObjectId,
  event_type: "click" | "view" | "booking" | "reward",
  user_id: UUID,
  referral_id: UUID,
  listing_id: UUID,
  metadata: {},
  timestamp: ISODate,
  ip_address: String,
  user_agent: String
}
```

## Referral Logic Flow

### 1. Link Generation
```
User requests referral for Listing X
  ↓
System generates unique code: UUID + Base64 encoding
  ↓
Create referral record in database
  ↓
Return referral link: https://app.com/r/{code}
  ↓
Link stored with metadata:
  - User ID
  - Listing ID
  - Timestamp
  - Expiration (optional)
```

### 2. Link Tracking
```
User clicks referral link
  ↓
System extracts referral code
  ↓
Query database for referral record
  ↓
Increment click_count
  ↓
Log analytics event
  ↓
Redirect to Airbnb listing with tracking parameter
  ↓
Store tracking cookie/session
```

### 3. Booking Detection
```
Friend books on Airbnb
  ↓
Airbnb redirects back with booking confirmation
  OR
Webhook from Airbnb (if available)
  OR
Manual verification process
  ↓
System validates booking:
  - Check-in date passed
  - No cancellation
  - Minimum stay requirements met
  ↓
Update referral status to "booked"
  ↓
Calculate reward amount
  ↓
Create reward record (status: pending)
```

### 4. Reward Validation
```
Background job runs daily
  ↓
Check referrals with status "booked"
  ↓
For each referral:
  - Verify check-in date has passed
  - Check for cancellation (via Airbnb API or manual)
  - Validate minimum stay completed
  ↓
If valid:
  - Update reward status to "validated"
  - Add to user's reward balance
  - Check milestone progress
  - Send notification
```

### 5. Milestone Processing
```
After reward validation
  ↓
Query user's total validated bookings
  ↓
Check milestone thresholds:
  - 5 bookings → Free night unlocked
  - 20 bookings → Premium Ambassador
  - 50 bookings → VIP Ambassador
  ↓
If milestone reached:
  - Create reward record (type: free_night or bonus)
  - Update user's ambassador_tier
  - Send notification
  - Update milestone progress
```

## Payment Flow

### Withdrawal Process
```
User requests withdrawal
  ↓
Validate:
  - Sufficient balance
  - Payment method linked
  - Account verified
  ↓
Create transaction record (status: pending)
  ↓
Call payment provider API (Stripe/PayPal)
  ↓
If successful:
  - Update transaction status: completed
  - Deduct from user balance
  - Send confirmation notification
  ↓
If failed:
  - Update transaction status: failed
  - Log error
  - Notify user with retry option
```

### Payment Provider Integration
- **Stripe Connect:** For direct payouts
- **PayPal Payouts API:** For PayPal transfers
- **Bank Transfers:** Via Plaid or similar service

## Security Architecture

### Authentication
- **JWT Tokens:** Access token (15 min expiry) + Refresh token (7 days)
- **Token Storage:** Secure keychain (iOS) / Keystore (Android)
- **Password Hashing:** bcrypt with salt rounds = 12

### API Security
- **HTTPS:** All communications encrypted
- **Rate Limiting:** Per user/IP (100 req/min)
- **Input Validation:** Sanitize all user inputs
- **SQL Injection Prevention:** Parameterized queries
- **XSS Prevention:** Content Security Policy headers

### Data Protection
- **Encryption at Rest:** AES-256 for sensitive data
- **PII Encryption:** Encrypt email, phone, payment info
- **GDPR Compliance:** Data anonymization, right to deletion

## Deployment Architecture

### Infrastructure
- **Cloud Provider:** AWS / GCP / Azure
- **Containerization:** Docker + Kubernetes
- **Load Balancing:** Application Load Balancer
- **Auto-scaling:** Based on CPU/memory metrics

### CI/CD Pipeline
```
Code Push → GitHub/GitLab
  ↓
Automated Tests
  ↓
Build Docker Images
  ↓
Deploy to Staging
  ↓
Integration Tests
  ↓
Deploy to Production (Blue-Green)
  ↓
Health Checks
  ↓
Rollback if issues detected
```

### Monitoring & Logging
- **Application Monitoring:** New Relic, Datadog, or Prometheus
- **Error Tracking:** Sentry
- **Log Aggregation:** ELK Stack or CloudWatch
- **Uptime Monitoring:** Pingdom or UptimeRobot

## Technology Stack Recommendations

### Backend
- **Language & Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Database:** MongoDB (Atlas or self‑hosted cluster)
- **Cache:** Redis 7+
- **Message Queue:** RabbitMQ or AWS SQS
- **Job Queue:** Bull (Node.js)

### Mobile / Frontend
- **Mobile App:** React Native (iOS & Android)
- **State Management:** Redux or MobX
- **Networking:** Axios

### DevOps
- **Container Registry:** Docker Hub or AWS ECR
- **Orchestration:** Kubernetes
- **Infrastructure as Code:** Terraform
- **CI/CD:** GitHub Actions or GitLab CI


