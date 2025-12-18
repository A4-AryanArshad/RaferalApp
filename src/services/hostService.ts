import { PendingConfirmation, IPendingConfirmation } from '../models/PendingConfirmation';
import { Referral } from '../models/Referral';
import { Listing } from '../models/Listing';
import { RewardService } from './rewardService';
import { User } from '../models/User';
import mongoose from 'mongoose';

export interface HostDashboardStats {
  totalListings: number;
  activeListings: number;
  pendingConfirmations: number;
  confirmedBookings: number;
  rejectedBookings: number;
  totalRevenue: number;
  totalCommissionsPaid: number;
}

export interface HostConfirmationData {
  confirmationId: string;
  action: 'confirm' | 'reject';
  rejectionReason?: string;
}

export class HostService {
  /**
   * Verify user is a host
   */
  static async verifyHost(userId: string): Promise<boolean> {
    // Optimized: only fetch the role field, use lean() for better performance
    const user = await User.findById(userId).select('role').lean();
    return user?.role === 'host';
  }

  /**
   * Get host dashboard statistics
   */
  static async getHostDashboardStats(hostId: string): Promise<HostDashboardStats> {
    console.log(`[HostService] Getting dashboard stats for host: ${hostId}`);
    
    // Ensure hostId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      throw new Error('Invalid host ID format');
    }
    
    // Verify user is a host (optimized - only fetch role field)
    const user = await User.findById(hostId).select('role').lean();
    if (!user || user.role !== 'host') {
      throw new Error('User is not a host');
    }
    console.log(`[HostService] Host verified, fetching listings...`);
    const listingsStartTime = Date.now();

    // Get listings (use lean() for better performance)
    // Convert hostId to ObjectId if it's a string
    const hostObjectId = typeof hostId === 'string' ? new mongoose.Types.ObjectId(hostId) : hostId;
    console.log(`[HostService] Querying listings with hostId: ${hostObjectId}`);
    
    // Optimized: Only fetch _id and status fields (minimal data transfer)
    // This dramatically reduces query time, especially if listings have large image arrays
    const allListings = await Listing.find({ hostId: hostObjectId })
      .select('_id status')
      .lean()
      .maxTimeMS(5000); // Timeout after 5 seconds
    const listingsTime = Date.now() - listingsStartTime;
    console.log(`[HostService] Found ${allListings.length} listings in ${listingsTime}ms`);
    
    const activeListings = allListings.filter((l) => l.status === 'active');
    const listingIds = allListings.map((l) => l._id);
    console.log(`[HostService] Listing IDs: ${listingIds.length}`);

    // Execute all queries in parallel for maximum performance
    console.log(`[HostService] Executing parallel queries...`);
    const startTime = Date.now();
    
    try {
      const [
        pendingConfirmations,
        confirmedBookings,
        rejectedBookings,
        confirmedReferrals,
      ] = await Promise.all([
        (async () => {
          console.log(`[HostService] Starting pendingConfirmations query...`);
          const result = await PendingConfirmation.countDocuments({
            hostId: hostObjectId,
            status: 'pending_host_confirmation',
          });
          console.log(`[HostService] pendingConfirmations: ${result}`);
          return result;
        })(),
        (async () => {
          console.log(`[HostService] Starting confirmedBookings query...`);
          const result = await PendingConfirmation.countDocuments({
            hostId: hostObjectId,
            status: 'host_confirmed',
          });
          console.log(`[HostService] confirmedBookings: ${result}`);
          return result;
        })(),
        (async () => {
          console.log(`[HostService] Starting rejectedBookings query...`);
          const result = await PendingConfirmation.countDocuments({
            hostId: hostObjectId,
            status: 'host_rejected',
          });
          console.log(`[HostService] rejectedBookings: ${result}`);
          return result;
        })(),
        // Only query referrals if we have listings
        listingIds.length > 0
          ? (async () => {
              console.log(`[HostService] Starting confirmedReferrals query...`);
              const result = await Referral.find({
                listingId: { $in: listingIds },
                status: 'completed',
              }).lean();
              console.log(`[HostService] confirmedReferrals: ${result.length}`);
              return result;
            })()
          : Promise.resolve([]),
      ]);
      
      const queryTime = Date.now() - startTime;
      console.log(`[HostService] All queries completed in ${queryTime}ms`);

      const totalRevenue = confirmedReferrals.reduce(
        (sum, r) => sum + (r.bookingValue || 0),
        0
      );

      // Calculate commissions paid (10% of revenue)
      const totalCommissionsPaid = totalRevenue * 0.1;

      const result = {
        totalListings: allListings.length,
        activeListings: activeListings.length,
        pendingConfirmations,
        confirmedBookings,
        rejectedBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommissionsPaid: Math.round(totalCommissionsPaid * 100) / 100,
      };
      
      console.log(`[HostService] Returning stats:`, result);
      return result;
    } catch (queryError: any) {
      console.error(`[HostService] Error in parallel queries:`, queryError);
      throw queryError;
    }
  }

  /**
   * Get pending confirmations for host
   */
  static async getPendingConfirmations(
    hostId: string,
    filters?: {
      limit?: number;
      skip?: number;
    }
  ): Promise<IPendingConfirmation[]> {
    console.log(
      `[HostService] getPendingConfirmations for host: ${hostId} with filters:`,
      filters
    );

    // Verify user is a host
    const isHost = await this.verifyHost(hostId);
    if (!isHost) {
      throw new Error('User is not a host');
    }

    const query: any = {
      hostId,
      status: 'pending_host_confirmation',
    };

    const limit = Math.min(filters?.limit || 50, 100);
    const skip = filters?.skip || 0;

    const startTime = Date.now();

    // IMPORTANT PERFORMANCE OPTIMIZATION:
    // - Use lean()
    // - Only populate minimal listing fields (no images)
    // - Avoid populating referralId (not needed for the host confirmations list)
    const confirmations = await PendingConfirmation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: 'listingId',
        select: 'title location.city location.country',
      })
      .lean()
      .maxTimeMS(10000) // 10 second timeout
      .exec();

    const totalTime = Date.now() - startTime;
    console.log(
      `[HostService] getPendingConfirmations completed in ${totalTime}ms (returned ${confirmations.length} items)`
    );

    return confirmations;
  }

  /**
   * Get all confirmations for host (pending, confirmed, rejected)
   */
  static async getHostConfirmations(
    hostId: string,
    filters?: {
      status?: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<IPendingConfirmation[]> {
    // Verify user is a host
    const isHost = await this.verifyHost(hostId);
    if (!isHost) {
      throw new Error('User is not a host');
    }

    const query: any = { hostId };

    if (filters?.status) {
      query.status = filters.status;
    }

    const limit = filters?.limit || 50;
    const skip = filters?.skip || 0;

    return PendingConfirmation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('referralId')
      .populate('listingId')
      .exec();
  }

  /**
   * Confirm a referral booking
   */
  static async confirmReferral(
    hostId: string,
    confirmationId: string
  ): Promise<IPendingConfirmation> {
    console.log(
      `[HostService] confirmReferral called for host=${hostId}, confirmationId=${confirmationId}`
    );

    // Verify user is a host
    const isHost = await this.verifyHost(hostId);
    if (!isHost) {
      throw new Error('User is not a host');
    }

    // Find confirmation (lean, no populate to avoid heavy listing images)
    const confirmation = await PendingConfirmation.findById(confirmationId)
      .lean()
      .maxTimeMS(10000)
      .exec();

    if (!confirmation) {
      console.error('[HostService] confirmReferral: confirmation not found');
      throw new Error('Confirmation not found');
    }

    // Verify host owns the listing
    if (confirmation.hostId?.toString() !== hostId) {
      console.error(
        '[HostService] confirmReferral: hostId mismatch',
        'confirmation.hostId=',
        confirmation.hostId?.toString(),
        'hostId=',
        hostId
      );
      throw new Error('Access denied: This confirmation does not belong to you');
    }

    if (confirmation.status !== 'pending_host_confirmation') {
      console.error(
        '[HostService] confirmReferral: invalid status',
        'status=',
        confirmation.status
      );
      throw new Error('Confirmation is not in pending status');
    }

    // Update confirmation status (separate update to keep query light)
    const updatedConfirmation = await PendingConfirmation.findByIdAndUpdate(
      confirmationId,
      {
        status: 'host_confirmed',
        hostConfirmedAt: new Date(),
      },
      { new: true }
    )
      .lean()
      .maxTimeMS(10000)
      .exec();

    // Update referral status to completed and create reward
    if (confirmation.referralId) {
      const referral = await Referral.findById(confirmation.referralId)
        .lean()
        .maxTimeMS(10000)
        .exec();

      if (referral) {
        await Referral.findByIdAndUpdate(referral._id, {
          status: 'completed',
          bookingValue: referral.bookingValue || 0,
        }).exec();

        // Create fixed 5-point reward for referrer
        try {
          const rewardAmount = 5; // 5 points per confirmed booking

          await RewardService.createReward({
            userId: referral.userId.toString(),
            referralId: referral._id.toString(),
            type: 'bonus',
            amount: rewardAmount,
            currency: 'POINTS',
            notes: `5 points for confirmed booking via referral ${confirmation.referralCode}`,
          });
        } catch (error) {
          console.error('Failed to create reward:', error);
          // Don't throw - reward can be created later
        }
      }
    }

    console.log(
      '[HostService] confirmReferral completed successfully for confirmationId=',
      confirmationId
    );

    // updatedConfirmation should not be null here, but fallback to original if needed
    return (updatedConfirmation as IPendingConfirmation) || (confirmation as any);
  }

  /**
   * Reject a referral booking
   */
  static async rejectReferral(
    hostId: string,
    confirmationId: string,
    rejectionReason?: string
  ): Promise<IPendingConfirmation> {
    // Verify user is a host
    const isHost = await this.verifyHost(hostId);
    if (!isHost) {
      throw new Error('User is not a host');
    }

    // Find confirmation
    const confirmation = await PendingConfirmation.findById(confirmationId);

    if (!confirmation) {
      throw new Error('Confirmation not found');
    }

    // Verify host owns the listing
    if (confirmation.hostId?.toString() !== hostId) {
      throw new Error('Access denied: This confirmation does not belong to you');
    }

    if (confirmation.status !== 'pending_host_confirmation') {
      throw new Error('Confirmation is not in pending status');
    }

    // Update confirmation status
    confirmation.status = 'host_rejected';
    confirmation.hostConfirmedAt = new Date();
    if (rejectionReason) {
      confirmation.hostRejectedReason = rejectionReason;
    }
    await confirmation.save();

    // Update referral status back to active (booking was rejected)
    if (confirmation.referralId) {
      const referral = await Referral.findById(confirmation.referralId);
      if (referral) {
        referral.status = 'active';
        await referral.save();
      }
    }

    return confirmation;
  }

  /**
   * Get host's listings with statistics (OPTIMIZED - uses aggregation instead of N+1 queries)
   */
  static async getHostListingsWithStats(hostId: string) {
    console.log(`[HostService] getHostListingsWithStats for host: ${hostId}`);
    const startTime = Date.now();

    // Verify user is a host (optimized)
    const user = await User.findById(hostId).select('role').lean();
    if (!user || user.role !== 'host') {
      throw new Error('User is not a host');
    }
    
    console.log(`[HostService] Fetching listings...`);
    const listingsStartTime = Date.now();

    // Convert hostId to ObjectId
    const hostObjectId =
      typeof hostId === 'string' ? new mongoose.Types.ObjectId(hostId) : hostId;

    // For dashboard, include only first image for thumbnail (keep payload small)
    // Limit to 10 for dashboard to keep it fast
    const listings = await Listing.find({ hostId: hostObjectId })
      .select('title location pricePerNight currency rating reviewCount status images createdAt') // Include images for thumbnail
      .sort({ createdAt: -1 })
      .limit(10) // Reduced limit for faster dashboard loading
      .lean()
      .maxTimeMS(5000); // Fail fast instead of hanging for a long time

    const listingsTime = Date.now() - listingsStartTime;
    console.log(`[HostService] Found ${listings.length} listings in ${listingsTime}ms`);
    
    const listingIds = listings.map((l) => l._id);
    
    if (listingIds.length === 0) {
      console.log(`[HostService] No listings, returning empty array`);
      return [];
    }
    
    console.log(`[HostService] Fetching stats for ${listingIds.length} listings...`);
    const statsStartTime = Date.now();

    // Fetch all stats in parallel for better performance
    const [allReferrals, allPendingConfirmations, allConfirmedBookings] = await Promise.all([
      Referral.find({ listingId: { $in: listingIds } })
        .select('listingId status') // Only select needed fields
        .lean()
        .maxTimeMS(5000),
      PendingConfirmation.find({
        listingId: { $in: listingIds },
        status: 'pending_host_confirmation',
      })
        .select('listingId') // Only need listingId for counting
        .lean()
        .maxTimeMS(5000),
      PendingConfirmation.find({
        listingId: { $in: listingIds },
        status: 'host_confirmed',
      })
        .select('listingId') // Only need listingId for counting
        .lean()
        .maxTimeMS(5000),
    ]);

    // Group statistics by listingId
    const referralsByListing = new Map<string, typeof allReferrals>();
    const pendingByListing = new Map<string, number>();
    const confirmedByListing = new Map<string, number>();

    allReferrals.forEach((ref) => {
      const listingId = ref.listingId?.toString();
      if (listingId) {
        if (!referralsByListing.has(listingId)) {
          referralsByListing.set(listingId, []);
        }
        referralsByListing.get(listingId)!.push(ref);
      }
    });

    allPendingConfirmations.forEach((conf) => {
      const listingId = conf.listingId?.toString();
      if (listingId) {
        pendingByListing.set(listingId, (pendingByListing.get(listingId) || 0) + 1);
      }
    });

    allConfirmedBookings.forEach((conf) => {
      const listingId = conf.listingId?.toString();
      if (listingId) {
        confirmedByListing.set(listingId, (confirmedByListing.get(listingId) || 0) + 1);
      }
    });

    // Helper to filter only Cloudinary URLs and return first image for thumbnail
    const getFirstCloudinaryImage = (images: any[] | undefined): string[] => {
      if (!images || !Array.isArray(images)) return [];
      const cloudinaryImages = images.filter((img) => {
        if (!img || typeof img !== 'string') return false;
        return img.startsWith('https://res.cloudinary.com/') || img.startsWith('http://res.cloudinary.com/');
      });
      // Return only first image for dashboard thumbnail
      return cloudinaryImages.length > 0 ? [cloudinaryImages[0]] : [];
    };

    // Build response with pre-calculated stats
    // Include only first image for dashboard thumbnail
    const listingsWithStats = listings.map((listing) => {
      const listingId = listing._id.toString();
      const referrals = referralsByListing.get(listingId) || [];

      return {
        listing: {
          ...listing,
          images: getFirstCloudinaryImage(listing.images), // Only first Cloudinary image for thumbnail
        },
        stats: {
          totalReferrals: referrals.length,
          activeReferrals: referrals.filter((r) => r.status === 'active').length,
          completedReferrals: referrals.filter((r) => r.status === 'completed').length,
          pendingConfirmations: pendingByListing.get(listingId) || 0,
          confirmedBookings: confirmedByListing.get(listingId) || 0,
        },
      };
    });
    
    const statsTime = Date.now() - statsStartTime;
    const totalTime = Date.now() - startTime;
    console.log(`[HostService] Stats fetched in ${statsTime}ms, total time: ${totalTime}ms`);
    console.log(`[HostService] Returning ${listingsWithStats.length} listings with stats`);

    return listingsWithStats;
  }
}

