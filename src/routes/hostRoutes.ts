import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { HostService } from '../services/hostService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/host/dashboard
 * Get host dashboard statistics (protected - host only)
 */
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  console.log(`[HostRoutes] GET /dashboard - Request received`);
  
  try {
    if (!req.user) {
      console.log(`[HostRoutes] No user in request`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[HostRoutes] Calling getHostDashboardStats for userId: ${req.user.userId}`);
    const stats = await HostService.getHostDashboardStats(req.user.userId);
    
    const totalTime = Date.now() - startTime;
    console.log(`[HostRoutes] Dashboard stats fetched successfully in ${totalTime}ms`);
    
    res.json({ stats });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[HostRoutes] Error after ${totalTime}ms:`, error.message);
    
    if (error.message === 'User is not a host') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
  }
});

/**
 * GET /api/host/listings
 * Get host listings with statistics (protected - host only)
 */
router.get('/listings', authenticate, async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  console.log(`[HostRoutes] GET /listings - Request received`);
  
  try {
    if (!req.user) {
      console.log(`[HostRoutes] No user in request`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[HostRoutes] Calling getHostListingsWithStats for userId: ${req.user.userId}`);
    const listings = await HostService.getHostListingsWithStats(req.user.userId);
    
    const totalTime = Date.now() - startTime;
    console.log(`[HostRoutes] Listings fetched successfully in ${totalTime}ms, count: ${listings.length}`);
    
    res.json({ listings });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[HostRoutes] Error after ${totalTime}ms:`, error.message);
    
    if (error.message === 'User is not a host') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Failed to fetch listings' });
  }
});

/**
 * GET /api/host/confirmations/pending
 * Get pending confirmations (protected - host only)
 */
router.get(
  '/confirmations/pending',
  authenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (req.query.limit) filters.limit = Number(req.query.limit);
      if (req.query.skip) filters.skip = Number(req.query.skip);

      const confirmations = await HostService.getPendingConfirmations(
        req.user.userId,
        filters
      );

      res.json({ confirmations });
    } catch (error: any) {
      if (error.message === 'User is not a host') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to fetch confirmations' });
    }
  }
);

/**
 * GET /api/host/confirmations
 * Get all confirmations (pending, confirmed, rejected) (protected - host only)
 */
router.get(
  '/confirmations',
  authenticate,
  [
    query('status').optional().isIn(['pending_host_confirmation', 'host_confirmed', 'host_rejected']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.limit) filters.limit = Number(req.query.limit);
      if (req.query.skip) filters.skip = Number(req.query.skip);

      const confirmations = await HostService.getHostConfirmations(
        req.user.userId,
        filters
      );

      res.json({ confirmations });
    } catch (error: any) {
      if (error.message === 'User is not a host') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to fetch confirmations' });
    }
  }
);

/**
 * POST /api/host/confirmations/:id/confirm
 * Confirm a referral booking (protected - host only)
 */
router.post(
  '/confirmations/:id/confirm',
  authenticate,
  [param('id').isMongoId()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const confirmation = await HostService.confirmReferral(
        req.user.userId,
        req.params.id
      );

      res.json({
        message: 'Referral booking confirmed successfully',
        confirmation,
      });
    } catch (error: any) {
      console.error(
        '[HostRoutes] Error in POST /confirmations/:id/confirm:',
        error.message,
        error.stack
      );
      if (error.message === 'User is not a host' || error.message.includes('Access denied')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(400).json({ error: error.message || 'Failed to confirm referral' });
    }
  }
);

/**
 * POST /api/host/confirmations/:id/reject
 * Reject a referral booking (protected - host only)
 */
router.post(
  '/confirmations/:id/reject',
  authenticate,
  [
    param('id').isMongoId(),
    body('rejectionReason').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { rejectionReason } = req.body;

      const confirmation = await HostService.rejectReferral(
        req.user.userId,
        req.params.id,
        rejectionReason
      );

      res.json({
        message: 'Referral booking rejected',
        confirmation,
      });
    } catch (error: any) {
      if (error.message === 'User is not a host' || error.message.includes('Access denied')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(400).json({ error: error.message || 'Failed to reject referral' });
    }
  }
);

export default router;

