import api from './api';

export interface Listing {
  _id: string;
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
  currency: string;
  images: string[];
  amenities: string[];
  airbnbListingUrl?: string;
  rating?: number;
  reviewCount?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
    address: string;
  };
  pricePerNight: number;
  currency?: string;
  images?: string[];
  amenities?: string[];
  airbnbListingUrl?: string;
}

export const listingService = {
  createListing: async (data: CreateListingData): Promise<Listing> => {
    const response = await api.post('/listings', data);
    return response.data.listing;
  },

  getListing: async (id: string): Promise<Listing> => {
    const response = await api.get(`/listings/${id}`);
    return response.data.listing;
  },

  searchListings: async (params: {
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    limit?: number;
  }): Promise<Listing[]> => {
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.country) queryParams.append('country', params.country);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.amenities) {
      params.amenities.forEach(a => queryParams.append('amenities', a));
    }
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/listings/search?${queryParams.toString()}`);
    return response.data.listings;
  },

  getFeaturedListings: async (): Promise<Listing[]> => {
    const response = await api.get('/listings/featured');
    return response.data.listings;
  },

  getMyListings: async (): Promise<Listing[]> => {
    const response = await api.get('/listings/host/my');
    return response.data.listings;
  },

  updateListing: async (id: string, data: Partial<CreateListingData>): Promise<Listing> => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data.listing;
  },

  deleteListing: async (id: string): Promise<void> => {
    await api.delete(`/listings/${id}`);
  },
};


