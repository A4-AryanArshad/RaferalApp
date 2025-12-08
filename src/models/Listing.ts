import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  hostId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
    address: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  pricePerNight: number;
  currency: string;
  images: string[];
  amenities: string[];
  airbnbListingUrl?: string;
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema: Schema = new Schema(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    coordinates: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    airbnbListingUrl: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ListingSchema.index({ hostId: 1, status: 1 });
ListingSchema.index({ 'location.city': 1 });
ListingSchema.index({ pricePerNight: 1 });

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);


