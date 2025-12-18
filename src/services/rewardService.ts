import { Reward, IReward } from '../models/Reward';
import { Referral } from '../models/Referral';
import { Booking } from '../models/Booking';

export interface CreateRewardData {
  userId: string;
  referralId?: string;
  bookingId?: string;
  type: 'cash' | 'free_night' | 'bonus';
  amount: number;
  currency?: string;
  notes?: string;
}

export interface RewardCalculationParams {
  bookingAmount: number;
  commissionRate?: number; // Default 10%
  currency?: string;
}

export class RewardService {
  // Default commission rate (10%)
  private static readonly DEFAULT_COMMISSION_RATE = 0.1;

  /**
   * Calculate reward amount based on booking value
   */
  static calculateReward(params: RewardCalculationParams): number {
    const commissionRate = params.commissionRate || this.DEFAULT_COMMISSION_RATE;
    return Math.round(params.bookingAmount * commissionRate * 100) / 100; // Round to 2 decimals
  }

  /**
   * Create a new reward
   */
  static async createReward(data: CreateRewardData): Promise<IReward> {
    const reward = new Reward({
      userId: data.userId,
      referralId: data.referralId,
      bookingId: data.bookingId,
      type: data.type,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: 'pending',
      notes: data.notes,
    });

    await reward.save();
    return reward;
  }

  /**
   * Create reward from booking
   */
  static async createRewardFromBooking(
    bookingId: string,
    referralCode?: string
  ): Promise<IReward | null> {
    // Find booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Find referral if code provided
    let referral = null;
    if (referralCode) {
      referral = await Referral.findOne({ referralCode });
    } else if (booking.referralCode) {
      referral = await Referral.findOne({ referralCode: booking.referralCode });
    }

    if (!referral) {
      return null; // No referral found, no reward
    }

    // Calculate reward amount
    const rewardAmount = this.calculateReward({
      bookingAmount: booking.totalAmount,
      currency: booking.currency,
    });

    // Create reward
    const reward = await this.createReward({
      userId: referral.userId.toString(),
      referralId: referral._id.toString(),
      bookingId: booking.bookingId,
      type: 'cash',
      amount: rewardAmount,
      currency: booking.currency,
      notes: `Reward for booking ${booking.bookingId}`,
    });

    // Update referral status
    referral.status = 'completed';
    referral.bookingValue = booking.totalAmount;
    await referral.save();

    return reward;
  }

  /**
   * Get reward by ID
   */
  static async getRewardById(rewardId: string): Promise<IReward | null> {
    return Reward.findById(rewardId)
      .populate('userId', 'firstName lastName email')
      .populate('referralId')
      .exec();
  }

  /**
   * Get rewards for a user
   */
  static async getUserRewards(
    userId: string,
    filters?: {
      status?: string;
      type?: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<IReward[]> {
    const query: any = { userId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    const limit = filters?.limit || 50;
    const skip = filters?.skip || 0;

    return Reward.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('referralId')
      .exec();
  }

  /**
   * Get user reward balance
   */
  static async getUserBalance(userId: string): Promise<{
    totalEarned: number;
    pending: number;
    paid: number;
    currency: string;
  }> {
    const rewards = await Reward.find({ userId });

    const totalEarned = rewards.reduce((sum, r) => sum + r.amount, 0);
    const pending = rewards
      .filter((r) => r.status === 'pending' || r.status === 'validated')
      .reduce((sum, r) => sum + r.amount, 0);
    const paid = rewards
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.amount, 0);

    // Get most common currency or default to USD
    const currencyCounts: { [key: string]: number } = {};
    rewards.forEach((r) => {
      currencyCounts[r.currency] = (currencyCounts[r.currency] || 0) + 1;
    });
    const currency =
      Object.keys(currencyCounts).sort(
        (a, b) => currencyCounts[b] - currencyCounts[a]
      )[0] || 'USD';

    return {
      totalEarned: Math.round(totalEarned * 100) / 100,
      pending: Math.round(pending * 100) / 100,
      paid: Math.round(paid * 100) / 100,
      currency,
    };
  }

  /**
   * Validate reward (mark as validated)
   */
  static async validateReward(rewardId: string): Promise<IReward | null> {
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      return null;
    }

    if (reward.status !== 'pending') {
      throw new Error('Reward is not in pending status');
    }

    reward.status = 'validated';
    reward.validatedAt = new Date();
    await reward.save();

    return reward;
  }

  /**
   * Mark reward as paid
   */
  static async markRewardAsPaid(
    rewardId: string,
    transactionId: string
  ): Promise<IReward | null> {
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      return null;
    }

    reward.status = 'paid';
    reward.paidAt = new Date();
    reward.transactionId = transactionId as any;
    await reward.save();

    return reward;
  }

  /**
   * Cancel reward
   */
  static async cancelReward(rewardId: string): Promise<IReward | null> {
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      return null;
    }

    if (reward.status === 'paid') {
      throw new Error('Cannot cancel a paid reward');
    }

    reward.status = 'cancelled';
    await reward.save();

    return reward;
  }

  /**
   * Get user milestones (e.g., 5 bookings = free night)
   */
  static async getUserMilestones(userId: string): Promise<{
    completedBookings: number;
    nextMilestone: number;
    freeNightsEarned: number;
  }> {
    const completedReferrals = await Referral.countDocuments({
      userId,
      status: 'completed',
    });

    const freeNightsEarned = Math.floor(completedReferrals / 5);
    const nextMilestone = (Math.floor(completedReferrals / 5) + 1) * 5;

    return {
      completedBookings: completedReferrals,
      nextMilestone,
      freeNightsEarned,
    };
  }
}




