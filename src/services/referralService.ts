import { Referral, IReferral } from '../models/Referral';
import { ReferralEmail, IReferralEmail } from '../models/ReferralEmail';
import { PendingConfirmation, IPendingConfirmation } from '../models/PendingConfirmation';
import { generateReferralCode, isValidReferralCode } from '../utils/referralCode';

export interface CreateReferralData {
  userId: string;
  listingId?: string;
  baseUrl?: string;
}

export interface TrackClickData {
  referralCode: string;
  email?: string;
}

export interface TrackBookingData {
  referralCode: string;
  guestEmail: string;
  bookingConfirmation?: string;
  checkIn: Date;
  checkOut: Date;
  reportedBy: 'guest' | 'referrer';
}

export class ReferralService {
  /**
   * Generate a unique referral code and create referral record
   */
  static async createReferral(data: CreateReferralData): Promise<IReferral> {
    // Hardcoded default URLs
    const DEFAULT_BASE_URL = 'https://app.com';
    const DEFAULT_FRONTEND_URL = 'http://localhost:8081';
    
    const baseUrl = data.baseUrl || DEFAULT_BASE_URL;
    
    // Generate unique referral code
    let referralCode = generateReferralCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await Referral.findOne({ referralCode });
      if (!existing) {
        break;
      }
      referralCode = generateReferralCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique referral code');
    }

    // Create referral link - use default if baseUrl not provided
    const finalBaseUrl = baseUrl || DEFAULT_FRONTEND_URL;
    const referralLink = `${finalBaseUrl}/r/${referralCode}`;

    // Create referral record
    const referral = new Referral({
      userId: data.userId,
      listingId: data.listingId,
      referralCode,
      referralLink,
      status: 'active',
      clickCount: 0,
      viewCount: 0,
    });

    await referral.save();
    return referral;
  }

  /**
   * Get referral by code
   */
  static async getReferralByCode(referralCode: string): Promise<IReferral | null> {
    if (!isValidReferralCode(referralCode)) {
      return null;
    }

    return Referral.findOne({ referralCode });
  }

  /**
   * Get referral by ID
   */
  static async getReferralById(referralId: string): Promise<IReferral | null> {
    return Referral.findById(referralId).populate('userId', 'firstName lastName email');
  }

  /**
   * Get all referrals for a user
   */
  static async getUserReferrals(userId: string, status?: string): Promise<IReferral[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    return Referral.find(query)
      .sort({ createdAt: -1 })
      .populate('listingId');
  }

  /**
   * Track referral link click
   */
  static async trackClick(data: TrackClickData): Promise<{ referral: IReferral; emailRecord?: IReferralEmail }> {
    const referral = await this.getReferralByCode(data.referralCode);
    
    if (!referral) {
      throw new Error('Invalid referral code');
    }

    // Increment click count
    referral.clickCount += 1;
    await referral.save();

    // If email provided, store it
    let emailRecord: IReferralEmail | undefined;
    if (data.email) {
      emailRecord = new ReferralEmail({
        email: data.email.toLowerCase(),
        referralCode: data.referralCode,
        clickedAt: new Date(),
      });
      await emailRecord.save();
    }

    return { referral, emailRecord };
  }

  /**
   * Track referral view (when someone views the listing page)
   */
  static async trackView(referralCode: string): Promise<IReferral | null> {
    const referral = await this.getReferralByCode(referralCode);
    
    if (!referral) {
      return null;
    }

    referral.viewCount += 1;
    await referral.save();

    return referral;
  }

  /**
   * Track booking (when someone reports a booking)
   */
  static async trackBooking(data: TrackBookingData): Promise<{ referral: IReferral; confirmation: IPendingConfirmation }> {
    const referral = await this.getReferralByCode(data.referralCode);
    
    if (!referral) {
      throw new Error('Invalid referral code');
    }

    // Update referral status
    referral.status = 'booked';
    referral.bookingDate = new Date();
    referral.checkInDate = data.checkIn;
    referral.checkOutDate = data.checkOut;
    await referral.save();

    // Create pending confirmation record
    const confirmation = new PendingConfirmation({
      referralId: referral._id,
      referralCode: data.referralCode,
      guestEmail: data.guestEmail.toLowerCase(),
      bookingConfirmation: data.bookingConfirmation,
      bookingDates: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      },
      reportedBy: data.reportedBy,
      status: 'pending_host_confirmation',
    });

    await confirmation.save();

    return { referral, confirmation };
  }

  /**
   * Validate referral code format
   */
  static validateReferralCode(code: string): boolean {
    return isValidReferralCode(code);
  }

  /**
   * Get referral statistics for a user
   */
  static async getUserReferralStats(userId: string): Promise<{
    totalReferrals: number;
    activeReferrals: number;
    bookedReferrals: number;
    completedReferrals: number;
    totalClicks: number;
    totalViews: number;
  }> {
    // Ensure userId is a valid ObjectId string
    if (!userId || typeof userId !== 'string') {
      console.warn('Invalid user ID provided to getUserReferralStats:', userId);
      // Return default stats instead of throwing
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        bookedReferrals: 0,
        completedReferrals: 0,
        totalClicks: 0,
        totalViews: 0,
      };
    }

    // Convert to ObjectId if needed
    const mongoose = require('mongoose');
    
    // Check if it's a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn('Invalid user ID format:', userId);
      // Return default stats instead of throwing
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        bookedReferrals: 0,
        completedReferrals: 0,
        totalClicks: 0,
        totalViews: 0,
      };
    }

    // Use ObjectId for query
    const queryUserId = new mongoose.Types.ObjectId(userId);
    const referrals = await Referral.find({ userId: queryUserId });

    const stats = {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter(r => r.status === 'active').length,
      bookedReferrals: referrals.filter(r => r.status === 'booked').length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      totalClicks: referrals.reduce((sum, r) => sum + r.clickCount, 0),
      totalViews: referrals.reduce((sum, r) => sum + r.viewCount, 0),
    };

    return stats;
  }
}



