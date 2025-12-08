import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDatabase } from '../src/config/database';
import userRoutes from '../src/routes/userRoutes';
import referralRoutes from '../src/routes/referralRoutes';
import listingRoutes from '../src/routes/listingRoutes';

const app = express();

// Hardcoded configuration
const CORS_ORIGIN = '*'; // Allow all origins
const NODE_ENV = 'production';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

