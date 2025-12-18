import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingId: string; // Cloudbeds booking ID
  propertyId: string; // Cloudbeds property ID
  referralId?: mongoose.Types.ObjectId;
  referralCode?: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  roomTypeId: string;
  totalAmount: number;
  currency: string;
  status: string; // Cloudbeds booking status
  cloudbedsData?: any; // Full Cloudbeds booking data
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    propertyId: {
      type: String,
      required: true,
      index: true,
    },
    referralId: {
      type: Schema.Types.ObjectId,
      ref: 'Referral',
      index: true,
    },
    referralCode: {
      type: String,
      index: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    roomTypeId: {
      type: String,
      required: true,
    },
    totalAmount: {
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
      required: true,
      index: true,
    },
    cloudbedsData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
BookingSchema.index({ propertyId: 1, status: 1 });
BookingSchema.index({ referralCode: 1 });
BookingSchema.index({ guestEmail: 1 });
BookingSchema.index({ checkIn: 1, checkOut: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);




