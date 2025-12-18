import mongoose, { Document, Schema } from 'mongoose';

export interface IReward extends Document {
  userId: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  bookingId?: string; // Cloudbeds booking ID
  type: 'cash' | 'free_night' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'validated' | 'paid' | 'cancelled';
  validatedAt?: Date;
  paidAt?: Date;
  transactionId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referralId: {
      type: Schema.Types.ObjectId,
      ref: 'Referral',
      index: true,
    },
    bookingId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ['cash', 'free_night', 'bonus'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'validated', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
    validatedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RewardSchema.index({ userId: 1, status: 1 });
RewardSchema.index({ referralId: 1 });
RewardSchema.index({ bookingId: 1 });
RewardSchema.index({ createdAt: -1 });

export const Reward = mongoose.model<IReward>('Reward', RewardSchema);




