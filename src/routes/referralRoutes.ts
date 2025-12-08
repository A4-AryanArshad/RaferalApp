import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ReferralService } from '../services/referralService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Referral } from '../models/Referral';

const router = express.Router();

/**
 * POST /api/referrals/generate
 * Generate a new referral link (protected)
 */
router.post(
  '/generate',
  authenticate,
  [
    body('listingId').optional().isMongoId().withMessage('Invalid listing ID format'),
    body('baseUrl').optional().custom((value) => {
      if (!value) return true; // Optional field
      // Allow exp://, http://, https://, and other valid URL schemes
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }).withMessage('Invalid URL format'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array().map(e => e.msg || e.msg).join(', '),
          errors: errors.array() 
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { listingId, baseUrl } = req.body;

      const referral = await ReferralService.createReferral({
        userId: req.user.userId,
        listingId,
        baseUrl,
      });

      res.status(201).json({
        message: 'Referral link generated successfully',
        referral,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate referral' });
    }
  }
);

/**
 * GET /api/referrals/stats
 * Get referral statistics for current user (protected)
 * IMPORTANT: This must be defined BEFORE /:id route to avoid route conflicts
 */
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 Stats endpoint called');
    console.log('User from token:', req.user ? { userId: req.user.userId, email: req.user.email } : 'No user');
    
    if (!req.user) {
      console.warn('⚠️ No user in request, returning default stats');
      return res.json({
        stats: {
          totalReferrals: 0,
          activeReferrals: 0,
          bookedReferrals: 0,
          completedReferrals: 0,
          totalClicks: 0,
          totalViews: 0,
        },
      });
    }

    if (!req.user.userId) {
      console.warn('⚠️ User ID not found in token, returning default stats');
      return res.json({
        stats: {
          totalReferrals: 0,
          activeReferrals: 0,
          bookedReferrals: 0,
          completedReferrals: 0,
          totalClicks: 0,
          totalViews: 0,
        },
      });
    }

    console.log('🔍 Fetching stats for userId:', req.user.userId);
    const stats = await ReferralService.getUserReferralStats(req.user.userId);
    console.log('✅ Stats fetched successfully:', stats);
    res.json({ stats });
  } catch (error: any) {
    console.error('❌ Stats error:', error);
    console.error('Error stack:', error.stack);
    // Return 200 with default stats instead of error
    res.json({
      stats: {
        totalReferrals: 0,
        activeReferrals: 0,
        bookedReferrals: 0,
        completedReferrals: 0,
        totalClicks: 0,
        totalViews: 0,
      },
    });
  }
});

/**
 * GET /api/referrals/user/:userId
 * Get all referrals for a user (protected)
 * IMPORTANT: Must be defined BEFORE /:id route to avoid route conflicts
 */
router.get(
  '/user/:userId',
  authenticate,
  [param('userId').isMongoId().withMessage('Invalid user ID format')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array().map(e => e.msg).join(', '),
          errors: errors.array() 
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify user is requesting their own referrals
      if (req.params.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { status } = req.query;

      const referrals = await ReferralService.getUserReferrals(
        req.params.userId,
        status as string
      );

      res.json({ referrals });
    } catch (error: any) {
      console.error('Error fetching user referrals:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch referrals' });
    }
  }
);

/**
 * GET /api/referrals/:id
 * Get referral by ID (protected)
 * IMPORTANT: This must be defined AFTER specific routes like /stats and /user/:userId
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid referral ID format')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array().map(e => e.msg).join(', '),
          errors: errors.array() 
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get referral without populating to check ownership first
      const referral = await Referral.findById(req.params.id);

      if (!referral) {
        return res.status(404).json({ error: 'Referral not found' });
      }

      // Verify user owns this referral
      // userId is an ObjectId, so convert both to strings for comparison
      const referralUserId = referral.userId.toString();
      const requestUserId = req.user.userId.toString();
      
      if (referralUserId !== requestUserId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Now populate the userId for the response
      await referral.populate('userId', 'firstName lastName email');

      res.json({ referral });
    } catch (error: any) {
      console.error('Error fetching referral:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch referral' });
    }
  }
);

/**
 * POST /api/referrals/track-click
 * Track referral link click (public endpoint)
 */
router.post(
  '/track-click',
  [
    body('referralCode').trim().notEmpty().withMessage('Referral code is required'),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { referralCode, email } = req.body;

      const result = await ReferralService.trackClick({ referralCode, email });

      res.json({
        message: 'Click tracked successfully',
        referral: result.referral,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to track click' });
    }
  }
);

/**
 * POST /api/referrals/track-view
 * Track referral view (public endpoint)
 */
router.post(
  '/track-view',
  [body('referralCode').trim().notEmpty().withMessage('Referral code is required')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { referralCode } = req.body;

      const referral = await ReferralService.trackView(referralCode);

      if (!referral) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }

      res.json({
        message: 'View tracked successfully',
        referral,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to track view' });
    }
  }
);

/**
 * GET /api/referrals/code/:code
 * Get referral info by code (public endpoint for landing pages)
 */
router.get(
  '/code/:code',
  [param('code').trim().notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const referral = await ReferralService.getReferralByCode(req.params.code);

      if (!referral) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }

      // Track view automatically when referral is accessed
      await ReferralService.trackView(req.params.code);

      // Populate listing if exists
      const referralObj = referral.toObject();
      if (referral.listingId) {
        const Listing = require('../models/Listing').Listing;
        const listing = await Listing.findById(referral.listingId);
        if (listing) {
          referralObj.listing = listing;
        }
      }

      res.json({ referral: referralObj });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch referral' });
    }
  }
);

/**
 * POST /api/referrals/track-booking
 * Track booking (protected - can be called by referrer or guest)
 */
router.post(
  '/track-booking',
  authenticate,
  [
    body('referralCode').trim().notEmpty().withMessage('Referral code is required'),
    body('guestEmail').isEmail().normalizeEmail(),
    body('checkIn').isISO8601().toDate(),
    body('checkOut').isISO8601().toDate(),
    body('bookingConfirmation').optional().trim(),
    body('reportedBy').isIn(['guest', 'referrer']),
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

      const { referralCode, guestEmail, bookingConfirmation, checkIn, checkOut, reportedBy } = req.body;

      const result = await ReferralService.trackBooking({
        referralCode,
        guestEmail,
        bookingConfirmation,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        reportedBy,
      });

      res.status(201).json({
        message: 'Booking tracked successfully',
        referral: result.referral,
        confirmation: result.confirmation,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to track booking' });
    }
  }
);

export default router;



