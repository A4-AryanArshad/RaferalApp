import api from './api';

export interface Referral {
  _id: string;
  userId: string;
  listingId?: string;
  referralCode: string;
  referralLink: string;
  status: 'active' | 'booked' | 'completed' | 'expired';
  clickCount: number;
  viewCount: number;
  bookingValue?: number;
  bookingDate?: string;
  checkInDate?: string;
  checkOutDate?: string;
  createdAt: string;
  updatedAt: string;
  confirmationStatus?: 'pending_host_confirmation' | 'host_confirmed' | 'host_rejected' | null;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  bookedReferrals: number;
  completedReferrals: number;
  totalClicks: number;
  totalViews: number;
}

export interface CreateReferralData {
  listingId?: string;
  baseUrl?: string;
}

export const referralService = {
  createReferral: async (data: CreateReferralData): Promise<Referral> => {
    const response = await api.post('/referrals/generate', data);
    return response.data.referral;
  },

  getReferral: async (id: string): Promise<Referral> => {
    const response = await api.get(`/referrals/${id}`);
    return response.data.referral;
  },

  getUserReferrals: async (userId: string, status?: string, confirmationStatus?: 'pending_host_confirmation' | 'host_confirmed'): Promise<Referral[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (confirmationStatus) params.append('confirmationStatus', confirmationStatus);
    const queryString = params.toString();
    const url = queryString
      ? `/referrals/user/${userId}?${queryString}`
      : `/referrals/user/${userId}`;
    const response = await api.get(url);
    return response.data.referrals;
  },

  getStats: async (): Promise<ReferralStats> => {
    const response = await api.get('/referrals/stats');
    return response.data.stats;
  },

  trackClick: async (referralCode: string, email?: string): Promise<Referral> => {
    const response = await api.post('/referrals/track-click', {
      referralCode,
      email,
    });
    return response.data.referral;
  },

  getReferralByCode: async (code: string): Promise<any> => {
    const response = await api.get(`/referrals/code/${code}`);
    return response.data.referral;
  },

  trackBooking: async (data: {
    referralCode: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    bookingConfirmation?: string;
  }): Promise<void> => {
    await api.post('/referrals/track-booking', {
      ...data,
      reportedBy: 'guest',
    });
  },

  getMyBookings: async (status?: 'pending_host_confirmation' | 'host_confirmed' | 'host_rejected'): Promise<any[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/referrals/my-bookings${params}`);
    return response.data.confirmations;
  },
};


