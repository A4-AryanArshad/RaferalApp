import api from './api';

export interface PendingConfirmation {
  _id: string;
  referralCode: string;
  guestEmail: string;
  bookingDates: {
    checkIn: string;
    checkOut: string;
  };
  status: 'pending_host_confirmation' | 'host_confirmed' | 'host_rejected';
  createdAt: string;
  updatedAt: string;
  listingId?: {
    _id: string;
    title: string;
    location?: {
      city?: string;
      country?: string;
    };
  } | null;
}

export const hostService = {
  getPendingConfirmations: async (params?: {limit?: number; skip?: number}) => {
    const query: string[] = [];
    if (params?.limit) query.push(`limit=${params.limit}`);
    if (params?.skip) query.push(`skip=${params.skip}`);
    const qs = query.length ? `?${query.join('&')}` : '';

    const response = await api.get(`/host/confirmations/pending${qs}`);
    return response.data.confirmations as PendingConfirmation[];
  },

  confirmBooking: async (id: string) => {
    await api.post(`/host/confirmations/${id}/confirm`);
  },

  rejectBooking: async (id: string, reason?: string) => {
    await api.post(`/host/confirmations/${id}/reject`, {
      hostRejectedReason: reason,
    });
  },
};



