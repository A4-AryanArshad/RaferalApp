import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  userId: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  referralCode: string;
  referralLink: string;
  status: 'active' | 'booked' | 'completed' | 'expired';
  clickCount: number;
  viewCount: number;
  bookingValue?: number;
  bookingDate?: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referralLink: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'booked', 'completed', 'expired'],
      default: 'active',
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    bookingValue: {
      type: Number,
    },
    bookingDate: {
      type: Date,
    },
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReferralSchema.index({ userId: 1, status: 1 });
ReferralSchema.index({ referralCode: 1 });
ReferralSchema.index({ listingId: 1, status: 1 }); // Important for host dashboard queries

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);



