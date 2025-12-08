import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ListingService } from '../services/listingService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/listings
 * Create a new listing (protected)
 */
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('location.city').trim().notEmpty().withMessage('City is required'),
    body('location.country').trim().notEmpty().withMessage('Country is required'),
    body('location.address').trim().notEmpty().withMessage('Address is required'),
    body('pricePerNight').isNumeric().withMessage('Price must be a number'),
    body('currency').optional().trim(),
    body('images').optional().isArray(),
    body('amenities').optional().isArray(),
    body('airbnbListingUrl').optional().isURL().withMessage('Invalid Airbnb URL'),
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

      const listing = await ListingService.createListing({
        hostId: req.user.userId,
        ...req.body,
      });

      res.status(201).json({
        message: 'Listing created successfully',
        listing,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create listing' });
    }
  }
);

/**
 * GET /api/listings/search
 * Search listings (public)
 */
router.get(
  '/search',
  [
    query('city').optional().trim(),
    query('country').optional().trim(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('amenities').optional(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const params: any = {};
      if (req.query.city) params.city = req.query.city as string;
      if (req.query.country) params.country = req.query.country as string;
      if (req.query.minPrice) params.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) params.maxPrice = Number(req.query.maxPrice);
      if (req.query.amenities) {
        params.amenities = Array.isArray(req.query.amenities)
          ? req.query.amenities
          : [req.query.amenities];
      }
      if (req.query.limit) params.limit = Number(req.query.limit);
      if (req.query.skip) params.skip = Number(req.query.skip);

      const listings = await ListingService.searchListings(params);

      res.json({ listings });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to search listings' });
    }
  }
);

/**
 * GET /api/listings/featured
 * Get featured listings (public)
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const listings = await ListingService.getFeaturedListings(limit);

    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch featured listings' });
  }
});

/**
 * GET /api/listings/:id
 * Get listing by ID (public)
 */
router.get(
  '/:id',
  [param('id').isMongoId()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const listing = await ListingService.getListingById(req.params.id);

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      res.json({ listing });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch listing' });
    }
  }
);

/**
 * GET /api/listings/host/my
 * Get current user's listings (protected)
 */
router.get('/host/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const listings = await ListingService.getHostListings(req.user.userId);

    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch listings' });
  }
});

/**
 * PUT /api/listings/:id
 * Update listing (protected - host only)
 */
router.put(
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

      const listing = await ListingService.updateListing(
        req.params.id,
        req.user.userId,
        req.body
      );

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found or access denied' });
      }

      res.json({
        message: 'Listing updated successfully',
        listing,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update listing' });
    }
  }
);

/**
 * DELETE /api/listings/:id
 * Delete listing (protected - host only)
 */
router.delete(
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

      const deleted = await ListingService.deleteListing(req.params.id, req.user.userId);

      if (!deleted) {
        return res.status(404).json({ error: 'Listing not found or access denied' });
      }

      res.json({ message: 'Listing deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete listing' });
    }
  }
);

export default router;


