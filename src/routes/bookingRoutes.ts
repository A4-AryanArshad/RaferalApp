import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { cloudbedsService, CloudbedsService } from '../services/cloudbedsService';
import { Booking, IBooking } from '../models/Booking';
import { Referral } from '../models/Referral';
import { RewardService } from '../services/rewardService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/bookings/properties
 * Get Cloudbeds properties (protected)
 */
router.get('/properties', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const properties = await cloudbedsService.getProperties();

    res.json({ properties });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch properties' });
  }
});

/**
 * GET /api/bookings/properties/:id
 * Get property details (protected)
 */
router.get(
  '/properties/:id',
  authenticate,
  [param('id').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const property = await cloudbedsService.getPropertyById(req.params.id);

      res.json({ property });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch property' });
    }
  }
);

/**
 * GET /api/bookings/properties/:id/room-types
 * Get room types for a property (protected)
 */
router.get(
  '/properties/:id/room-types',
  authenticate,
  [param('id').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const roomTypes = await cloudbedsService.getRoomTypes(req.params.id);

      res.json({ roomTypes });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch room types' });
    }
  }
);

/**
 * GET /api/bookings/properties/:id/availability
 * Get availability for a property (protected)
 */
router.get(
  '/properties/:id/availability',
  authenticate,
  [
    param('id').notEmpty(),
    query('start_date').isISO8601().withMessage('Invalid start date'),
    query('end_date').isISO8601().withMessage('Invalid end date'),
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

      const availability = await cloudbedsService.getAvailability(
        req.params.id,
        req.query.start_date as string,
        req.query.end_date as string
      );

      res.json({ availability });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch availability' });
    }
  }
);

/**
 * GET /api/bookings/properties/:id/rates
 * Get rates for a property (protected)
 */
router.get(
  '/properties/:id/rates',
  authenticate,
  [
    param('id').notEmpty(),
    query('start_date').isISO8601().withMessage('Invalid start date'),
    query('end_date').isISO8601().withMessage('Invalid end date'),
    query('room_type_id').optional().trim(),
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

      const rates = await cloudbedsService.getRates(
        req.params.id,
        req.query.start_date as string,
        req.query.end_date as string,
        req.query.room_type_id as string | undefined
      );

      res.json({ rates });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch rates' });
    }
  }
);

/**
 * POST /api/bookings
 * Create a booking through Cloudbeds (protected)
 */
router.post(
  '/',
  authenticate,
  [
    body('property_id').notEmpty().withMessage('Property ID is required'),
    body('guest_name').trim().notEmpty().withMessage('Guest name is required'),
    body('guest_email').isEmail().normalizeEmail(),
    body('check_in').isISO8601().withMessage('Invalid check-in date'),
    body('check_out').isISO8601().withMessage('Invalid check-out date'),
    body('room_type_id').notEmpty().withMessage('Room type ID is required'),
    body('referral_code').optional().trim(),
    body('notes').optional().trim(),
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

      const {
        property_id,
        guest_name,
        guest_email,
        check_in,
        check_out,
        room_type_id,
        referral_code,
        notes,
      } = req.body;

      // Create booking in Cloudbeds
      const cloudbedsBooking = await cloudbedsService.createBooking({
        property_id,
        guest_name,
        guest_email,
        check_in,
        check_out,
        room_type_id,
        referral_code,
        notes,
      });

      // Save booking to our database
      const booking = new Booking({
        bookingId: cloudbedsBooking.booking_id,
        propertyId: cloudbedsBooking.property_id,
        referralCode: referral_code,
        guestName: cloudbedsBooking.guest_name,
        guestEmail: cloudbedsBooking.guest_email,
        checkIn: new Date(cloudbedsBooking.check_in),
        checkOut: new Date(cloudbedsBooking.check_out),
        roomTypeId: cloudbedsBooking.room_type_id,
        totalAmount: cloudbedsBooking.total_amount,
        currency: cloudbedsBooking.currency,
        status: cloudbedsBooking.status,
        cloudbedsData: cloudbedsBooking,
      });

      // Find referral if code provided
      if (referral_code) {
        const referral = await Referral.findOne({ referralCode: referral_code });
        if (referral) {
          booking.referralId = referral._id;
          booking.referralCode = referral_code;

          // Update referral status
          referral.status = 'booked';
          referral.bookingDate = new Date();
          referral.checkInDate = new Date(check_in);
          referral.checkOutDate = new Date(check_out);
          referral.bookingValue = cloudbedsBooking.total_amount;
          await referral.save();
        }
      }

      await booking.save();

      // Create reward if referral exists
      if (booking.referralId) {
        await RewardService.createRewardFromBooking(
          booking.bookingId,
          referral_code
        );
      }

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
        cloudbedsBooking,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create booking' });
    }
  }
);

/**
 * GET /api/bookings/:id
 * Get booking by ID (protected)
 */
router.get(
  '/:id',
  authenticate,
  [param('id').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Try to find in our database first
      let booking = await Booking.findOne({ bookingId: req.params.id })
        .populate('referralId')
        .exec();

      // If not found, fetch from Cloudbeds
      if (!booking) {
        const cloudbedsBooking = await cloudbedsService.getBookingById(req.params.id);

        // Save to database
        booking = new Booking({
          bookingId: cloudbedsBooking.booking_id,
          propertyId: cloudbedsBooking.property_id,
          referralCode: cloudbedsService.extractReferralCode(cloudbedsBooking.notes),
          guestName: cloudbedsBooking.guest_name,
          guestEmail: cloudbedsBooking.guest_email,
          checkIn: new Date(cloudbedsBooking.check_in),
          checkOut: new Date(cloudbedsBooking.check_out),
          roomTypeId: cloudbedsBooking.room_type_id,
          totalAmount: cloudbedsBooking.total_amount,
          currency: cloudbedsBooking.currency,
          status: cloudbedsBooking.status,
          cloudbedsData: cloudbedsBooking,
        });

        // Find referral if code exists
        if (booking.referralCode) {
          const referral = await Referral.findOne({
            referralCode: booking.referralCode,
          });
          if (referral) {
            booking.referralId = referral._id;
          }
        }

        await booking.save();
      }

      res.json({ booking });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch booking' });
    }
  }
);

/**
 * GET /api/bookings
 * Get bookings (protected)
 */
router.get(
  '/',
  authenticate,
  [
    query('property_id').optional().trim(),
    query('referral_code').optional().trim(),
    query('status').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query: any = {};

      if (req.query.property_id) {
        query.propertyId = req.query.property_id;
      }

      if (req.query.referral_code) {
        query.referralCode = req.query.referral_code;
      }

      if (req.query.status) {
        query.status = req.query.status;
      }

      const bookings = await Booking.find(query)
        .sort({ createdAt: -1 })
        .populate('referralId')
        .limit(50)
        .exec();

      res.json({ bookings });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
    }
  }
);

export default router;




