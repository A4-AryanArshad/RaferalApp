import express, { Request, Response } from 'express';
import { cloudbedsService } from '../services/cloudbedsService';
import { Booking } from '../models/Booking';
import { Referral } from '../models/Referral';
import { RewardService } from '../services/rewardService';

const router = express.Router();

/**
 * POST /api/webhooks/cloudbeds
 * Handle Cloudbeds webhook events (public - but should verify signature)
 */
router.post('/cloudbeds', async (req: Request, res: Response) => {
  try {
    const event = req.body;

    // Verify webhook signature if provided
    const signature = req.headers['x-cloudbeds-signature'] as string;
    if (signature) {
      const isValid = cloudbedsService.validateWebhookSignature(
        JSON.stringify(event),
        signature
      );
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Handle different event types
    switch (event.event_type) {
      case 'booking.created':
      case 'booking.confirmed':
        await handleBookingEvent(event);
        break;

      case 'booking.cancelled':
        await handleBookingCancellation(event);
        break;

      case 'booking.modified':
        await handleBookingModification(event);
        break;

      default:
        console.log('Unhandled webhook event type:', event.event_type);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Cloudbeds from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * Handle booking creation/confirmation event
 */
async function handleBookingEvent(event: any): Promise<void> {
  const bookingData = event.data;

  if (!bookingData || !bookingData.booking_id) {
    console.error('Invalid booking data in webhook');
    return;
  }

  try {
    // Extract referral code from booking notes
    const referralCode = cloudbedsService.extractReferralCode(bookingData.notes);

    // Check if booking already exists
    let booking = await Booking.findOne({ bookingId: bookingData.booking_id });

    if (!booking) {
      // Create new booking record
      booking = new Booking({
        bookingId: bookingData.booking_id,
        propertyId: bookingData.property_id || event.property_id,
        referralCode: referralCode || undefined,
        guestName: bookingData.guest_name || 'Unknown',
        guestEmail: bookingData.guest_email || '',
        checkIn: new Date(bookingData.check_in),
        checkOut: new Date(bookingData.check_out),
        roomTypeId: bookingData.room_type_id || '',
        totalAmount: bookingData.total_amount || 0,
        currency: bookingData.currency || 'USD',
        status: bookingData.status || 'confirmed',
        cloudbedsData: bookingData,
      });

      // Find referral if code exists
      if (referralCode) {
        const referral = await Referral.findOne({ referralCode });
        if (referral) {
          booking.referralId = referral._id;

          // Update referral status
          referral.status = 'booked';
          referral.bookingDate = new Date();
          referral.checkInDate = new Date(bookingData.check_in);
          referral.checkOutDate = new Date(bookingData.check_out);
          referral.bookingValue = bookingData.total_amount || 0;
          await referral.save();

          // Create reward
          await RewardService.createRewardFromBooking(
            booking.bookingId,
            referralCode
          );
        }
      }

      await booking.save();
    } else {
      // Update existing booking
      booking.status = bookingData.status || booking.status;
      booking.totalAmount = bookingData.total_amount || booking.totalAmount;
      booking.cloudbedsData = bookingData;
      await booking.save();

      // If referral code exists and reward not created yet, create it
      if (referralCode && !booking.referralId) {
        const referral = await Referral.findOne({ referralCode });
        if (referral) {
          booking.referralId = referral._id;
          await booking.save();

          // Create reward
          await RewardService.createRewardFromBooking(
            booking.bookingId,
            referralCode
          );
        }
      }
    }

    console.log(`✅ Processed booking webhook: ${bookingData.booking_id}`);
  } catch (error: any) {
    console.error('Error processing booking webhook:', error);
    throw error;
  }
}

/**
 * Handle booking cancellation event
 */
async function handleBookingCancellation(event: any): Promise<void> {
  const bookingData = event.data;

  if (!bookingData || !bookingData.booking_id) {
    return;
  }

  try {
    const booking = await Booking.findOne({ bookingId: bookingData.booking_id });

    if (booking) {
      booking.status = 'cancelled';
      await booking.save();

      // Cancel associated rewards
      if (booking.referralId) {
        // Find and cancel pending rewards for this referral
        const { Reward } = require('../models/Reward');
        const rewards = await Reward.find({
          referralId: booking.referralId,
          status: { $in: ['pending', 'validated'] },
        });

        for (const reward of rewards) {
          await RewardService.cancelReward(reward._id.toString());
        }
      }
    }
  } catch (error: any) {
    console.error('Error processing cancellation webhook:', error);
    throw error;
  }
}

/**
 * Handle booking modification event
 */
async function handleBookingModification(event: any): Promise<void> {
  const bookingData = event.data;

  if (!bookingData || !bookingData.booking_id) {
    return;
  }

  try {
    const booking = await Booking.findOne({ bookingId: bookingData.booking_id });

    if (booking) {
      // Update booking with new data
      if (bookingData.check_in) booking.checkIn = new Date(bookingData.check_in);
      if (bookingData.check_out) booking.checkOut = new Date(bookingData.check_out);
      if (bookingData.total_amount) booking.totalAmount = bookingData.total_amount;
      if (bookingData.status) booking.status = bookingData.status;
      booking.cloudbedsData = bookingData;
      await booking.save();
    }
  } catch (error: any) {
    console.error('Error processing modification webhook:', error);
    throw error;
  }
}

export default router;




