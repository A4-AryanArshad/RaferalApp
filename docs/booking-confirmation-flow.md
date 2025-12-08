# Booking Confirmation Flow - Technical Details

## The Challenge

**Problem:** Airbnb doesn't tell us when someone books. We need to know:
1. Who booked (Sarah)
2. Which referral link they used
3. Their booking confirmation number
4. Host needs to verify it

## Realistic Solution: Multi-Step Process

### Step 1: When Sarah Clicks Your Referral Link

**What Happens:**
```
Sarah clicks: https://yourapp.com/r/XYZ789
  ↓
Your system:
  1. Extracts referral code: XYZ789
  2. Stores in database:
     - Referral code: XYZ789
     - Your user ID (who shared the link)
     - Listing ID
     - Timestamp
     - Click tracking cookie/session ID
  3. Redirects Sarah to Airbnb listing
  4. Sets a cookie: "referral_code=XYZ789"
```

**Technical Implementation:**
```javascript
// When referral link is clicked
app.get('/r/:referralCode', (req, res) => {
  const code = req.params.referralCode;
  
  // Store click in database
  await db.referrals.trackClick({
    code: code,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date()
  });
  
  // Set cookie to remember referral code
  res.cookie('referral_code', code, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
  
  // Redirect to Airbnb
  res.redirect('https://airbnb.com/rooms/LISTING_ID');
});
```

**Key Point:** We store the referral code in a cookie, but we DON'T know if Sarah will book.

---

### Step 2: Sarah Books on Airbnb

**What Happens:**
```
Sarah books on Airbnb
  ↓
Airbnb sends Sarah:
  - Confirmation email
  - Booking confirmation number (e.g., "ABC123")
  - Booking details (dates, amount, etc.)
  ↓
Your app: ❌ DOESN'T KNOW YET
```

**Problem:** Airbnb doesn't tell us. We need Sarah to tell us.

---

### Step 3: How We Get Sarah's Information

There is **no automatic email from our system asking Sarah if she booked**.
Everything is driven by **in-app forms** filled by the guest or the referrer.

**Option A: Capture Email When Link is Clicked (for matching only)**

We still capture the guest email at click time, but only so we can match
a later self-reported booking to the right referral code — not to send
follow‑up emails.

**What Happens:**
```
Sarah clicks referral link
  ↓
Before redirecting to Airbnb, show a simple page:
  "Pour suivre votre réservation et vos récompenses,
   entrez votre email Airbnb."
  [Email input] [Continuer vers Airbnb]
  ↓
Sarah enters email: sarah@email.com
  ↓
System stores:
  - Email: sarah@email.com
  - Referral code: XYZ789
  - Timestamp
  ↓
Then redirects to Airbnb
```

**Technical Implementation (MongoDB collections)**
```javascript
app.get('/r/:referralCode', async (req, res) => {
  const code = req.params.referralCode;
  
  // Check if email already captured
  if (!req.cookies.email_captured) {
    // Show email capture page
    return res.render('capture-email', { referralCode: code });
  }
  
  // Track click and redirect
  await trackClick(code);
  res.redirect('https://airbnb.com/rooms/LISTING_ID');
});

// Email capture form submission (no email is sent to Sarah)
app.post('/capture-email', async (req, res) => {
  const { email, referralCode } = req.body;
  
  // Store email linked to referral code (MongoDB)
  await db.referralEmails.insertOne({
    email,
    referralCode,
    clickedAt: new Date()
  });
  
  // Set cookie so we don't ask again
  res.cookie('email_captured', 'true', { maxAge: 30 * 24 * 60 * 60 * 1000 });
  
  // Now redirect to Airbnb
  res.redirect(`/r/${referralCode}`);
});
```

**Option B: Ask Referrer for Guest Info**

**What Happens:**
```
You (referrer) share link with Sarah
  ↓
Sarah books (you don't know yet)
  ↓
Sarah tells you: "I booked!"
  ↓
You go to your app → "Report Booking"
  ↓
You enter:
  - Guest email: sarah@email.com
  - Booking dates: March 15-20
  - Booking confirmation: ABC123 (if Sarah shared it)
  ↓
System creates pending confirmation
```

**Technical Implementation:**
```javascript
// Referrer reports booking
app.post('/api/referrals/report-booking', async (req, res) => {
  const { referralCode, guestEmail, bookingDates, bookingConfirmation } = req.body;
  const userId = req.user.id; // Logged in referrer
  
  // Verify this referral code belongs to this user
  const referral = await db.referrals.findOne({
    code: referralCode,
    userId: userId
  });
  
  if (!referral) {
    return res.status(404).json({ error: 'Referral not found' });
  }
  
  // Create pending confirmation
  await db.pendingConfirmations.create({
    referralId: referral.id,
    referralCode: referralCode,
    guestEmail: guestEmail,
    bookingDates: bookingDates,
    bookingConfirmation: bookingConfirmation,
    reportedBy: 'referrer',
    status: 'pending_host_confirmation',
    createdAt: new Date()
  });
  
  // Notify host
  await notifyHost(referral.listingId, {
    guestEmail: guestEmail,
    bookingDates: bookingDates,
    referralCode: referralCode
  });
  
  res.json({ success: true });
});
```

---

### Step 4: System Matches Booking to Referral Code

**How Matching Works:**

**Database Structure:**
```sql
-- Referrals table
referrals:
  - id
  - code: "XYZ789"
  - userId: (your ID)
  - listingId: (Airbnb listing)

-- Captured emails table
referral_emails:
  - id
  - email: "sarah@email.com"
  - referralCode: "XYZ789"
  - timestamp

-- Pending confirmations table
pending_confirmations:
  - id
  - referralCode: "XYZ789"
  - guestEmail: "sarah@email.com"
  - bookingConfirmation: "ABC123"
  - bookingDates: "2024-03-15 to 2024-03-20"
  - status: "pending_host_confirmation"
```

**Matching Logic:**
```javascript
// When guest reports booking
app.post('/api/guests/report-booking', async (req, res) => {
  const { email, bookingConfirmation, bookingDates } = req.body;
  
  // Find referral code associated with this email
  const referralEmail = await db.referralEmails.findOne({
    email: email
  });
  
  if (!referralEmail) {
    return res.status(404).json({ 
      error: 'No referral found for this email. Did you use a referral link?' 
    });
  }
  
  // Get full referral details
  const referral = await db.referrals.findOne({
    code: referralEmail.referralCode
  });
  
  // Create pending confirmation
  await db.pendingConfirmations.create({
    referralId: referral.id,
    referralCode: referral.code,
    guestEmail: email,
    bookingConfirmation: bookingConfirmation,
    bookingDates: bookingDates,
    reportedBy: 'guest',
    status: 'pending_host_confirmation'
  });
  
  // Notify host
  await notifyHost(referral.listingId, {
    guestEmail: email,
    bookingDates: bookingDates,
    referralCode: referral.code,
    bookingConfirmation: bookingConfirmation
  });
  
  res.json({ 
    success: true,
    message: 'Booking reported! Host will confirm shortly.' 
  });
});
```

**Key Point:** Matching happens by:
1. Email address (if we captured it)
2. Referral code (if guest/referrer provides it)
3. Booking dates (for verification)

---

### Step 5: Host Gets Notification

**How Host is Notified:**

**Option A: Email Notification**
```javascript
async function notifyHost(listingId, bookingInfo) {
  // Get host info from listing
  const listing = await db.listings.findOne({ id: listingId });
  const host = await db.hosts.findOne({ id: listing.hostId });
  
  // Send email
  await emailService.send({
    to: host.email,
    subject: 'New Booking to Confirm',
    template: 'host-booking-confirmation',
    data: {
      guestEmail: bookingInfo.guestEmail,
      bookingDates: bookingInfo.bookingDates,
      referralCode: bookingInfo.referralCode,
      bookingConfirmation: bookingInfo.bookingConfirmation,
      confirmUrl: `https://yourapp.com/hosts/confirm/${bookingInfo.referralCode}`
    }
  });
}
```

**Option B: In-App Notification**
```javascript
// Create notification in database
await db.notifications.create({
  userId: host.id,
  type: 'pending_booking_confirmation',
  title: 'New Booking to Confirm',
  message: `Guest ${bookingInfo.guestEmail} booked. Please confirm referral code ${bookingInfo.referralCode}`,
  data: {
    referralCode: bookingInfo.referralCode,
    guestEmail: bookingInfo.guestEmail
  },
  read: false,
  createdAt: new Date()
});
```

**Option C: SMS Notification**
```javascript
await smsService.send({
  to: host.phone,
  message: `New booking from ${bookingInfo.guestEmail}. Confirm referral ${bookingInfo.referralCode} at yourapp.com/hosts`
});
```

---

### Step 6: Host Confirms Booking

**Host Dashboard:**
```javascript
// Host logs in and sees pending confirmations
app.get('/api/hosts/pending-confirmations', async (req, res) => {
  const hostId = req.user.id; // Logged in host
  
  // Get all listings for this host
  const listings = await db.listings.find({ hostId: hostId });
  const listingIds = listings.map(l => l.id);
  
  // Get referrals for these listings
  const referrals = await db.referrals.find({ 
    listingId: { $in: listingIds } 
  });
  const referralIds = referrals.map(r => r.id);
  
  // Get pending confirmations
  const pending = await db.pendingConfirmations.find({
    referralId: { $in: referralIds },
    status: 'pending_host_confirmation'
  });
  
  res.json({ pendingConfirmations: pending });
});
```

**Host Confirmation:**
```javascript
app.post('/api/hosts/confirm-booking', async (req, res) => {
  const { confirmationId, referralCode } = req.body;
  const hostId = req.user.id;
  
  // Verify host owns this listing
  const confirmation = await db.pendingConfirmations.findOne({
    id: confirmationId
  });
  
  const referral = await db.referrals.findOne({
    code: referralCode
  });
  
  const listing = await db.listings.findOne({
    id: referral.listingId
  });
  
  if (listing.hostId !== hostId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Update confirmation status
  await db.pendingConfirmations.update({
    id: confirmationId,
    status: 'host_confirmed',
    confirmedAt: new Date(),
    confirmedBy: hostId
  });
  
  // Update referral status
  await db.referrals.update({
    id: referral.id,
    status: 'booked',
    bookingDate: new Date()
  });
  
  // Calculate and create reward
  const reward = await calculateReward(referral.userId, listing.price);
  await db.rewards.create({
    userId: referral.userId,
    referralId: referral.id,
    amount: reward,
    status: 'pending_validation'
  });
  
  // Notify referrer
  await notifyReferrer(referral.userId, {
    message: 'Your referral was confirmed! Reward pending validation.',
    amount: reward
  });
  
  res.json({ success: true });
});
```

---

## Complete Technical Flow

```
1. Sarah clicks link → System stores email + referral code
   Database: { email: "sarah@email.com", code: "XYZ789" }

2. Sarah books on Airbnb → Gets confirmation "ABC123"
   Your system: ❌ Still doesn't know

3. Sarah reports booking:
   POST /api/guests/report-booking
   {
     email: "sarah@email.com",
     bookingConfirmation: "ABC123",
     bookingDates: "2024-03-15 to 2024-03-20"
   }
   
   System matches:
   - Finds referral_emails record with sarah@email.com
   - Gets referral code: XYZ789
   - Creates pending_confirmation record

4. Host gets email/SMS/notification:
   "New booking from sarah@email.com
    Referral code: XYZ789
    Booking: ABC123
    Dates: March 15-20
    [Click to Confirm]"

5. Host clicks link → Logs in → Sees booking details
   Host verifies in Airbnb account:
   - Sees booking from "Sarah"
   - Dates match: March 15-20
   - Confirmation number matches (if provided)

6. Host confirms:
   POST /api/hosts/confirm-booking
   {
     confirmationId: "123",
     referralCode: "XYZ789"
   }
   
   System:
   - Updates referral status: "booked"
   - Creates reward record
   - Notifies referrer

7. Reward validation (after check-in):
   - Background job checks if check-in date passed
   - Validates booking completed
   - Updates reward status: "validated"
   - Adds to referrer's balance
```

---

## Key Technical Points

1. **We CAN'T automatically detect bookings** - Must rely on manual reporting
2. **Email capture is critical** - Need to get guest email when they click link
3. **Matching is database-based** - Link email to referral code
4. **Host confirmation is manual** - Host must verify in Airbnb and confirm in your system
5. **Notifications are essential** - Email/SMS/In-app to alert host

---

## Database Schema Needed

```sql
-- Store emails captured from referral clicks
CREATE TABLE referral_emails (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  referral_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_referral_code (referral_code)
);

-- Store pending confirmations
CREATE TABLE pending_confirmations (
  id UUID PRIMARY KEY,
  referral_id UUID REFERENCES referrals(id),
  referral_code VARCHAR(50),
  guest_email VARCHAR(255),
  booking_confirmation VARCHAR(100),
  booking_dates VARCHAR(100),
  reported_by VARCHAR(50), -- 'guest' or 'referrer'
  status VARCHAR(50) DEFAULT 'pending_host_confirmation',
  host_confirmed_at TIMESTAMP,
  created_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_referral_code (referral_code)
);
```

---

## Summary

**How we know Sarah booked:**
- Sarah (or referrer) must tell us manually
- We capture email when link is clicked
- Guest reports booking with confirmation number

**How we match to referral code:**
- Database lookup: email → referral code
- Or referrer provides referral code when reporting

**How host confirms:**
- Host gets notification (email/SMS/app)
- Host logs into your system
- Host sees booking details
- Host verifies in Airbnb account
- Host clicks "Confirm" button
- System creates reward

The key is: **Everything is manual reporting + database matching + host verification**

