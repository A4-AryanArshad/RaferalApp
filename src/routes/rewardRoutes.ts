import express, { Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { RewardService } from '../services/rewardService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/rewards/balance
 * Get user reward balance (protected)
 */
router.get('/balance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const balance = await RewardService.getUserBalance(req.user.userId);

    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch balance' });
  }
});

/**
 * GET /api/rewards/history
 * Get user reward history (protected)
 */
router.get(
  '/history',
  authenticate,
  [
    query('status').optional().isIn(['pending', 'validated', 'paid', 'cancelled']),
    query('type').optional().isIn(['cash', 'free_night', 'bonus']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('[RewardRoutes] Validation errors:', errors.array());
        return res.status(400).json({ 
          error: 'Invalid query parameters',
          errors: errors.array() 
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.type) filters.type = req.query.type;
      if (req.query.limit) filters.limit = Number(req.query.limit);
      if (req.query.skip) filters.skip = Number(req.query.skip);

      console.log(`[RewardRoutes] GET /history for userId=${req.user.userId}, filters=`, filters);
      const rewards = await RewardService.getUserRewards(req.user.userId, filters);
      console.log(`[RewardRoutes] Returning ${rewards.length} rewards`);

      res.json({ rewards: rewards || [] });
    } catch (error: any) {
      console.error('[RewardRoutes] Error in /history:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch rewards' });
    }
  }
);

/**
 * GET /api/rewards/:id
 * Get reward by ID (protected)
 */
router.get(
  '/:id',
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

      const reward = await RewardService.getRewardById(req.params.id);

      if (!reward) {
        return res.status(404).json({ error: 'Reward not found' });
      }

      // Verify user owns this reward
      if (reward.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ reward });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch reward' });
    }
  }
);

/**
 * GET /api/rewards/milestones
 * Get user milestones (protected)
 */
router.get('/milestones', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const milestones = await RewardService.getUserMilestones(req.user.userId);

    res.json({ milestones });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch milestones' });
  }
});

/**
 * POST /api/rewards/:id/validate
 * Validate reward (protected - admin only in production)
 */
router.post(
  '/:id/validate',
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

      const reward = await RewardService.validateReward(req.params.id);

      if (!reward) {
        return res.status(404).json({ error: 'Reward not found' });
      }

      res.json({
        message: 'Reward validated successfully',
        reward,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to validate reward' });
    }
  }
);

export default router;



