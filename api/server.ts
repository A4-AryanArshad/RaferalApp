// Environment variables are now hardcoded for APK distribution
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

// Hardcoded configuration
const PORT = 3000;
const CORS_ORIGIN = '*'; // Allow all origins
const NODE_ENV = 'production';

const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
// Increase body size limit to handle base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Airbnb Referral Rewards API',
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
    message: false ? err.message : undefined, // Hardcoded: no error messages in production
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


