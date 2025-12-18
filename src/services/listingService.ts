import { Listing, IListing } from '../models/Listing';
import mongoose from 'mongoose';

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
   * Filter images to only include Cloudinary URLs (exclude base64, empty, invalid)
   */
  private static filterCloudinaryImages(images: any[] | undefined): string[] {
    if (!images || !Array.isArray(images)) {
      return [];
    }
    // Only return images that are Cloudinary URLs
    return images.filter((img) => {
      if (!img || typeof img !== 'string') return false;
      // Cloudinary URLs start with https://res.cloudinary.com/ or http://res.cloudinary.com/
      return img.startsWith('https://res.cloudinary.com/') || img.startsWith('http://res.cloudinary.com/');
    });
  }

  /**
   * Create a new listing
   */
  static async createListing(data: CreateListingData): Promise<IListing> {
    try {
      // Ensure hostId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(data.hostId)) {
        throw new Error('Invalid host ID format');
      }

      // If images are provided as base64, upload them to Cloudinary first
      let imageUrls = data.images || [];
      if (imageUrls.length > 0 && imageUrls[0]?.startsWith('data:image')) {
        console.log(`[ListingService] Uploading ${imageUrls.length} images to Cloudinary...`);
        try {
          const { CloudinaryService } = require('./cloudinaryService');
          const uploadStartTime = Date.now();
          const uploadResults = await CloudinaryService.uploadMultipleBase64(imageUrls);
          const uploadTime = Date.now() - uploadStartTime;
          imageUrls = uploadResults.map(result => result.secure_url);
          console.log(`[ListingService] Images uploaded successfully in ${uploadTime}ms, using URLs instead of base64`);
        } catch (error: any) {
          console.error(`[ListingService] Cloudinary upload failed:`, error.message);
          throw new Error(`Failed to upload images to Cloudinary: ${error.message}`);
        }
      }

      const listing = new Listing({
        ...data,
        images: imageUrls, // Use Cloudinary URLs instead of base64
        hostId: new mongoose.Types.ObjectId(data.hostId),
        status: 'active',
        reviewCount: 0,
      });

      await listing.save();
      return listing;
    } catch (error: any) {
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new Error(`Validation error: ${messages.join(', ')}`);
      }
      // Handle duplicate key errors
      if (error.code === 11000) {
        throw new Error('A listing with this information already exists');
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get listing by ID
   */
  static async getListingById(listingId: string): Promise<IListing | null> {
    const startTime = Date.now();
    console.log(`[ListingService] getListingById called with id=${listingId}`);

    // Images are now Cloudinary URLs (small strings), not base64, so include them
    const raw = await Listing.findById(listingId)
      .populate('hostId', 'firstName lastName email')
      .lean()
      .maxTimeMS(10000) // 10 second timeout
      .exec();

    if (!raw) {
      console.log('[ListingService] getListingById: listing not found');
      return null;
    }

    const listing: any = {
      ...raw,
      images: this.filterCloudinaryImages(raw.images), // Only Cloudinary URLs
    };

    const totalTime = Date.now() - startTime;
    console.log(
      `[ListingService] getListingById completed in ${totalTime}ms`
    );

    return listing as IListing;
  }

  /**
   * Get listings by host
   */
  static async getHostListings(hostId: string): Promise<IListing[]> {
    const listings = await Listing.find({ hostId })
      .sort({ createdAt: -1 })
      .populate('hostId', 'firstName lastName')
      .lean();
    
    // Filter images to only Cloudinary URLs
    return listings.map((listing: any) => ({
      ...listing,
      images: this.filterCloudinaryImages(listing.images),
    })) as IListing[];
  }

  /**
   * Search listings for public listing page / search screen.
   *
   * PERFORMANCE NOTES:
   * - Images are now Cloudinary URLs (small strings), not base64, so include them.
   * - No populate(), only lean() objects for performance.
   */
  static async searchListings(params: SearchListingsParams): Promise<IListing[]> {
    console.log(`[ListingService] searchListings called with params:`, params);
    const startTime = Date.now();

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

    const limit = Math.min(params.limit || 20, 50); // hard cap
    const skip = params.skip || 0;

    console.log(
      `[ListingService] Executing search query with limit: ${limit}, skip: ${skip}`
    );
    const queryStartTime = Date.now();

    // Include images for thumbnail (only first image to keep payload small)
    const listings = await Listing.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .select('title location pricePerNight currency rating reviewCount status images') // Include images for thumbnail
      .lean()
      .maxTimeMS(10000) // 10 second timeout
      .exec();
    
    const queryTime = Date.now() - queryStartTime;
    console.log(`[ListingService] Query completed in ${queryTime}ms, found ${listings.length} listings`);

    // Return only first Cloudinary image for list view thumbnail
    const processedListings = listings.map((listing: any) => {
      const cloudinaryImages = this.filterCloudinaryImages(listing.images);
      return {
        ...listing,
        images: cloudinaryImages.length > 0 ? [cloudinaryImages[0]] : [], // Only first image for thumbnail
      };
    });

    const totalTime = Date.now() - startTime;
    console.log(
      `[ListingService] searchListings completed in ${totalTime}ms (returned ${processedListings.length} listings)`
    );

    return processedListings;
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
   * Get featured listings for client dashboard.
   *
   * PERFORMANCE NOTES:
   * - Include only first image for thumbnail (keeps payload small).
   * - No populate(), only lean() objects for performance.
   */
  static async getFeaturedListings(limit: number = 10): Promise<IListing[]> {
    const startTime = Date.now();
    const safeLimit = Math.min(limit || 10, 20);

    console.log(
      `[ListingService] getFeaturedListings called with limit=${safeLimit}`
    );

    const listings = await Listing.find({ status: 'active' })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(safeLimit)
      .select('title location pricePerNight currency rating reviewCount status images') // Include images for thumbnail
      .lean()
      .maxTimeMS(10000) // 10 second timeout
      .exec();

    // Return only first Cloudinary image for dashboard thumbnail
    const processedListings = listings.map((listing: any) => {
      const cloudinaryImages = this.filterCloudinaryImages(listing.images);
      return {
        ...listing,
        images: cloudinaryImages.length > 0 ? [cloudinaryImages[0]] : [], // Only first image for thumbnail
      };
    });

    const totalTime = Date.now() - startTime;
    console.log(
      `[ListingService] getFeaturedListings completed in ${totalTime}ms (returned ${processedListings.length} listings)`
    );

    return processedListings;
  }
}


