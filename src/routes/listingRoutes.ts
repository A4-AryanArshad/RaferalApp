import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ListingService } from '../services/listingService';
import { cloudbedsService } from '../services/cloudbedsService';
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
    body('airbnbListingUrl')
      .optional({ checkFalsy: true })
      .trim()
      .isURL()
      .withMessage('Invalid Airbnb URL'),
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

      // Clean up the request body - remove empty strings and convert to undefined
      const cleanedBody = { ...req.body };
      if (cleanedBody.airbnbListingUrl === '') {
        delete cleanedBody.airbnbListingUrl;
      }

      // Validate and convert pricePerNight to number
      if (cleanedBody.pricePerNight !== undefined) {
        const price = parseFloat(cleanedBody.pricePerNight);
        if (isNaN(price) || price < 0) {
          return res.status(400).json({ error: 'Invalid price per night' });
        }
        cleanedBody.pricePerNight = price;
      }

      // Ensure hostId is valid
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Invalid user ID' });
      }

      const listing = await ListingService.createListing({
        hostId: req.user.userId,
        ...cleanedBody,
      });

      res.status(201).json({
        message: 'Listing created successfully',
        listing,
      });
    } catch (error: any) {
      console.error('Error creating listing:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: error.message || 'Failed to create listing',
        details: false ? error.stack : undefined // Hardcoded: no stack traces in production
      });
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
    const startTime = Date.now();
    console.log(`[ListingRoutes] GET /search - Request received`);
    
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

      console.log(`[ListingRoutes] Calling searchListings with params:`, params);
      const listings = await ListingService.searchListings(params);
      
      const totalTime = Date.now() - startTime;
      console.log(`[ListingRoutes] Search completed in ${totalTime}ms, returning ${listings.length} listings`);

      res.json({ listings });
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      console.error(`[ListingRoutes] Error after ${totalTime}ms:`, error.message);
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
 * GET /api/listings/cloudbeds
 * Get Cloudbeds properties (protected)
 */
router.get('/cloudbeds', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const properties = await cloudbedsService.getProperties();

    res.json({ properties });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Cloudbeds properties' });
  }
});

/**
 * POST /api/listings/sync-cloudbeds
 * Sync Cloudbeds properties to listings (protected - admin)
 */
router.post('/sync-cloudbeds', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get Cloudbeds properties
    const cloudbedsProperties = await cloudbedsService.getProperties();
    const { Listing } = require('../models/Listing');

    const syncedListings = [];

    for (const property of cloudbedsProperties) {
      // Check if listing already exists (by property_id stored in airbnbListingUrl or custom field)
      // For now, we'll use a simple approach - check by title match
      const existingListing = await Listing.findOne({
        title: property.property_name,
        'location.city': property.address.city,
      });

      if (!existingListing) {
        // Create listing from Cloudbeds property
        const listing = new Listing({
          hostId: req.user.userId, // Assign to current user or system user
          title: property.property_name,
          description: property.description || `Beautiful ${property.property_type} in ${property.address.city}`,
          location: {
            city: property.address.city,
            country: property.address.country,
            address: property.address.address_line_1 || `${property.address.city}, ${property.address.country}`,
          },
          coordinates: property.coordinates
            ? {
                lat: property.coordinates.latitude,
                lng: property.coordinates.longitude,
              }
            : undefined,
          pricePerNight: 0, // Will be updated from rates API
          currency: property.currency || 'USD',
          images: property.images || [],
          amenities: property.amenities || [],
          status: 'active',
          reviewCount: 0,
        });

        await listing.save();
        syncedListings.push(listing);
      }
    }

    res.json({
      message: 'Cloudbeds properties synced successfully',
      synced: syncedListings.length,
      total: cloudbedsProperties.length,
      listings: syncedListings,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to sync Cloudbeds properties' });
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


