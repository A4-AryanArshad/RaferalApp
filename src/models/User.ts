import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  phone?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'user' | 'host';
  ambassadorTier: 'standard' | 'premium' | 'vip';
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'host'],
      default: 'user',
      index: true,
    },
    ambassadorTier: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);



