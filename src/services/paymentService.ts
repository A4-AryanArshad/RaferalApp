import { Transaction, ITransaction } from '../models/Transaction';
import { Reward } from '../models/Reward';
import { RewardService } from './rewardService';

export interface CreateWithdrawalData {
  userId: string;
  amount: number;
  currency?: string;
  paymentMethod: {
    type: 'bank_transfer' | 'paypal' | 'stripe' | 'other';
    details: any;
  };
}

export interface PaymentMethodData {
  type: 'bank_transfer' | 'paypal' | 'stripe' | 'other';
  details: any;
}

export class PaymentService {
  /**
   * Get user payment methods (stored in user profile or separate collection)
   * For now, we'll return empty array - implement based on your needs
   */
  static async getUserPaymentMethods(userId: string): Promise<PaymentMethodData[]> {
    // TODO: Implement payment method storage/retrieval
    // This could be stored in User model or separate PaymentMethod collection
    return [];
  }

  /**
   * Save payment method for user
   */
  static async savePaymentMethod(
    userId: string,
    methodData: PaymentMethodData
  ): Promise<PaymentMethodData> {
    // TODO: Implement payment method storage
    // For now, just return the data
    return methodData;
  }

  /**
   * Create withdrawal transaction
   */
  static async createWithdrawal(
    data: CreateWithdrawalData
  ): Promise<ITransaction> {
    // Check user balance
    const balance = await RewardService.getUserBalance(data.userId);

    if (balance.pending < data.amount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction = new Transaction({
      userId: data.userId,
      type: 'withdrawal',
      amount: data.amount,
      currency: data.currency || balance.currency,
      status: 'pending',
      paymentMethod: data.paymentMethod,
    });

    await transaction.save();

    // Process withdrawal (async - in real app, use queue)
    this.processWithdrawal(transaction._id.toString()).catch((error) => {
      console.error('Failed to process withdrawal:', error);
    });

    return transaction;
  }

  /**
   * Process withdrawal (simulate payment processing)
   */
  private static async processWithdrawal(transactionId: string): Promise<void> {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    try {
      // Update status to processing
      transaction.status = 'processing';
      await transaction.save();

      // TODO: Integrate with actual payment gateway (Stripe, PayPal, etc.)
      // For now, simulate processing
      await this.simulatePaymentProcessing(transaction);

      // Mark as completed
      transaction.status = 'completed';
      transaction.processedAt = new Date();
      await transaction.save();

      // Mark associated rewards as paid
      if (transaction.rewardId) {
        await RewardService.markRewardAsPaid(
          transaction.rewardId.toString(),
          transactionId
        );
      } else {
        // Mark all pending rewards for this user as paid (up to withdrawal amount)
        await this.markRewardsAsPaidForWithdrawal(
          transaction.userId.toString(),
          transaction.amount,
          transactionId
        );
      }
    } catch (error: any) {
      transaction.status = 'failed';
      transaction.failureReason = error.message;
      await transaction.save();
      throw error;
    }
  }

  /**
   * Simulate payment processing
   */
  private static async simulatePaymentProcessing(
    transaction: ITransaction
  ): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real implementation, call payment gateway API
    // Example with Stripe:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const transfer = await stripe.transfers.create({
    //   amount: transaction.amount * 100, // Convert to cents
    //   currency: transaction.currency,
    //   destination: transaction.paymentMethod.details.account_id,
    // });

    // For now, just simulate success
    transaction.externalTransactionId = `sim_${Date.now()}`;
  }

  /**
   * Mark rewards as paid for withdrawal
   */
  private static async markRewardsAsPaidForWithdrawal(
    userId: string,
    amount: number,
    transactionId: string
  ): Promise<void> {
    const pendingRewards = await Reward.find({
      userId,
      status: { $in: ['pending', 'validated'] },
    }).sort({ createdAt: 1 });

    let remainingAmount = amount;

    for (const reward of pendingRewards) {
      if (remainingAmount <= 0) break;

      if (reward.amount <= remainingAmount) {
        await RewardService.markRewardAsPaid(
          reward._id.toString(),
          transactionId
        );
        remainingAmount -= reward.amount;
      }
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(
    transactionId: string
  ): Promise<ITransaction | null> {
    return Transaction.findById(transactionId)
      .populate('userId', 'firstName lastName email')
      .populate('rewardId')
      .exec();
  }

  /**
   * Get user transactions
   */
  static async getUserTransactions(
    userId: string,
    filters?: {
      type?: string;
      status?: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<ITransaction[]> {
    const query: any = { userId };

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const limit = filters?.limit || 50;
    const skip = filters?.skip || 0;

    return Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('rewardId')
      .exec();
  }

  /**
   * Process payment for reward (when reward is validated)
   */
  static async processRewardPayment(
    rewardId: string,
    paymentMethod: PaymentMethodData
  ): Promise<ITransaction> {
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      throw new Error('Reward not found');
    }

    if (reward.status !== 'validated') {
      throw new Error('Reward must be validated before payment');
    }

    // Create transaction
    const transaction = new Transaction({
      userId: reward.userId,
      rewardId: reward._id,
      type: 'deposit',
      amount: reward.amount,
      currency: reward.currency,
      status: 'pending',
      paymentMethod,
    });

    await transaction.save();

    // Process payment
    this.processWithdrawal(transaction._id.toString()).catch((error) => {
      console.error('Failed to process reward payment:', error);
    });

    return transaction;
  }
}




