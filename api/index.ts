import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { connectDatabase } from '../src/config/database';
import userRoutes from '../src/routes/userRoutes';
import referralRoutes from '../src/routes/referralRoutes';
import listingRoutes from '../src/routes/listingRoutes';

// Create Express app
const app = express();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
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
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// Database connection cache
let dbConnected = false;

// Export serverless handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Connect to database (connection is cached)
    if (!dbConnected) {
      await connectDatabase();
      dbConnected = true;
    }
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

