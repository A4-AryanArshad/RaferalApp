import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingConfirmation extends Document {
  referralId: mongoose.Types.ObjectId;
  referralCode: string;
  guestEmail: string;
  bookingConfirmation?: string;
  bookingDates: {
    checkIn: Date;
    checkOut: Date;
  };
  reportedBy: 'guest' | 'referrer';
  status: 'pending_host_confirmation' | 'host_confirmed' | 'host_rejected';
  hostConfirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PendingConfirmationSchema: Schema = new Schema(
  {
    referralId: {
      type: Schema.Types.ObjectId,
      ref: 'Referral',
      required: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    guestEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    bookingConfirmation: {
      type: String,
      trim: true,
    },
    bookingDates: {
      checkIn: {
        type: Date,
        required: true,
      },
      checkOut: {
        type: Date,
        required: true,
      },
    },
    reportedBy: {
      type: String,
      enum: ['guest', 'referrer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_host_confirmation', 'host_confirmed', 'host_rejected'],
      default: 'pending_host_confirmation',
    },
    hostConfirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PendingConfirmationSchema.index({ referralId: 1 });
PendingConfirmationSchema.index({ referralCode: 1 });
PendingConfirmationSchema.index({ status: 1 });

export const PendingConfirmation = mongoose.model<IPendingConfirmation>(
  'PendingConfirmation',
  PendingConfirmationSchema
);



