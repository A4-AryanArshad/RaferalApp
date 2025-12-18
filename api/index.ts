import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDatabase } from '../src/config/database';
import userRoutes from '../src/routes/userRoutes';
import referralRoutes from '../src/routes/referralRoutes';
import listingRoutes from '../src/routes/listingRoutes';
import rewardRoutes from '../src/routes/rewardRoutes';
import paymentRoutes from '../src/routes/paymentRoutes';
import bookingRoutes from '../src/routes/bookingRoutes';
import webhookRoutes from '../src/routes/webhookRoutes';
import hostRoutes from '../src/routes/hostRoutes';

const app = express();

// Hardcoded configuration
const CORS_ORIGIN = '*'; // Allow all origins
const NODE_ENV = 'production';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
// Increase body size limit to handle base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Disable caching for API endpoints to prevent 304 responses
app.use((req: Request, res: Response, next: NextFunction) => {
  // Disable caching for all API routes
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Airbnb Referral Rewards API',
    platform: 'Vercel',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/host', hostRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: undefined, // Don't expose error details in production
  });
});

// Export serverless handler for Vercel
export default async function handler(req: Request, res: Response) {
  try {
    // Connect to database (connection is cached)
    await connectDatabase();
    
    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

