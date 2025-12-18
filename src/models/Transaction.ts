import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  rewardId?: mongoose.Types.ObjectId;
  type: 'withdrawal' | 'deposit' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: {
    type: 'bank_transfer' | 'paypal' | 'stripe' | 'other';
    details?: any;
  };
  externalTransactionId?: string; // Payment gateway transaction ID
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
      index: true,
    },
    type: {
      type: String,
      enum: ['withdrawal', 'deposit', 'refund'],
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
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: {
        type: String,
        enum: ['bank_transfer', 'paypal', 'stripe', 'other'],
        required: true,
      },
      details: {
        type: Schema.Types.Mixed,
      },
    },
    externalTransactionId: {
      type: String,
      index: true,
    },
    failureReason: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ rewardId: 1 });
TransactionSchema.index({ externalTransactionId: 1 });
TransactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);




