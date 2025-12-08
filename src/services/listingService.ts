import { Listing, IListing } from '../models/Listing';

export interface CreateListingData {
  hostId: string;
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
  currency?: string;
  images?: string[];
  amenities?: string[];
  airbnbListingUrl?: string;
}

export interface SearchListingsParams {
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  limit?: number;
  skip?: number;
}

export class ListingService {
  /**
   * Create a new listing
   */
  static async createListing(data: CreateListingData): Promise<IListing> {
    const listing = new Listing({
      ...data,
      status: 'active',
      reviewCount: 0,
    });

    await listing.save();
    return listing;
  }

  /**
   * Get listing by ID
   */
  static async getListingById(listingId: string): Promise<IListing | null> {
    return Listing.findById(listingId)
      .populate('hostId', 'firstName lastName email')
      .exec();
  }

  /**
   * Get listings by host
   */
  static async getHostListings(hostId: string): Promise<IListing[]> {
    return Listing.find({ hostId })
      .sort({ createdAt: -1 })
      .populate('hostId', 'firstName lastName');
  }

  /**
   * Search listings
   */
  static async searchListings(params: SearchListingsParams): Promise<IListing[]> {
    const query: any = { status: 'active' };

    if (params.city) {
      query['location.city'] = new RegExp(params.city, 'i');
    }

    if (params.country) {
      query['location.country'] = new RegExp(params.country, 'i');
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      query.pricePerNight = {};
      if (params.minPrice !== undefined) {
        query.pricePerNight.$gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        query.pricePerNight.$lte = params.maxPrice;
      }
    }

    if (params.amenities && params.amenities.length > 0) {
      query.amenities = { $in: params.amenities };
    }

    const limit = params.limit || 20;
    const skip = params.skip || 0;

    return Listing.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('hostId', 'firstName lastName');
  }

  /**
   * Update listing
   */
  static async updateListing(
    listingId: string,
    hostId: string,
    data: Partial<CreateListingData>
  ): Promise<IListing | null> {
    const listing = await Listing.findOne({ _id: listingId, hostId });

    if (!listing) {
      throw new Error('Listing not found or access denied');
    }

    Object.assign(listing, data);
    await listing.save();

    return listing;
  }

  /**
   * Delete listing
   */
  static async deleteListing(listingId: string, hostId: string): Promise<boolean> {
    const result = await Listing.deleteOne({ _id: listingId, hostId });
    return result.deletedCount > 0;
  }

  /**
   * Get featured listings
   */
  static async getFeaturedListings(limit: number = 10): Promise<IListing[]> {
    return Listing.find({ status: 'active' })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .populate('hostId', 'firstName lastName');
  }
}


