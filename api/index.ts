import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../src/config/database';
import userRoutes from '../src/routes/userRoutes';
import referralRoutes from '../src/routes/referralRoutes';
import listingRoutes from '../src/routes/listingRoutes';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
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
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// Database connection cache
let dbConnected = false;

// Export serverless handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Connect to database (connection is cached)
    if (!dbConnected) {
      await connectDatabase();
      dbConnected = true;
    }
    
    // Convert Vercel request/response to Express format
    const expressReq = req as unknown as Request;
    const expressRes = res as unknown as Response;
    
    // Handle the request with Express app
    app(expressReq, expressRes);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
