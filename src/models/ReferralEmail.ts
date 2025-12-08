import mongoose, { Document, Schema } from 'mongoose';

export interface IReferralEmail extends Document {
  email: string;
  referralCode: string;
  clickedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralEmailSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReferralEmailSchema.index({ referralCode: 1 });
ReferralEmailSchema.index({ email: 1, referralCode: 1 });

export const ReferralEmail = mongoose.model<IReferralEmail>('ReferralEmail', ReferralEmailSchema);



