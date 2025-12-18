import axios, { AxiosInstance } from 'axios';

export interface CloudbedsProperty {
  property_id: string;
  property_name: string;
  property_type: string;
  address: {
    address_line_1: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  images?: string[];
  amenities?: string[];
  currency?: string;
}

export interface CloudbedsRoomType {
  room_type_id: string;
  room_type_name: string;
  max_occupancy: number;
  description?: string;
  images?: string[];
  base_price?: number;
}

export interface CloudbedsAvailability {
  room_type_id: string;
  date: string;
  available: number;
  price?: number;
}

export interface CloudbedsRate {
  room_type_id: string;
  date: string;
  rate: number;
  currency: string;
}

export interface CloudbedsBooking {
  booking_id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  room_type_id: string;
  total_amount: number;
  currency: string;
  status: string;
  notes?: string;
  referral_code?: string;
}

export interface CloudbedsWebhookEvent {
  event_type: string;
  property_id: string;
  booking_id?: string;
  data: any;
  timestamp: string;
}

export class CloudbedsService {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    // Get credentials from environment variables
    this.apiKey = process.env.CLOUDBEDS_API_KEY || '';
    this.apiSecret = process.env.CLOUDBEDS_API_SECRET || '';
    this.baseUrl = process.env.CLOUDBEDS_API_URL || 'https://api.cloudbeds.com/api/v1.2';

    // Create axios instance with default config
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config) => {
        if (this.apiKey) {
          config.headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get OAuth access token (if using OAuth instead of API key)
   */
  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      });

      return response.data.access_token;
    } catch (error: any) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Get all properties
   */
  async getProperties(): Promise<CloudbedsProperty[]> {
    try {
      const response = await this.apiClient.get('/properties');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Cloudbeds API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(propertyId: string): Promise<CloudbedsProperty> {
    try {
      const response = await this.apiClient.get(`/properties/${propertyId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  }

  /**
   * Get room types for a property
   */
  async getRoomTypes(propertyId: string): Promise<CloudbedsRoomType[]> {
    try {
      const response = await this.apiClient.get(`/properties/${propertyId}/room-types`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch room types: ${error.message}`);
    }
  }

  /**
   * Get availability for a property
   */
  async getAvailability(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<CloudbedsAvailability[]> {
    try {
      const response = await this.apiClient.get(
        `/properties/${propertyId}/availability`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }
      );
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch availability: ${error.message}`);
    }
  }

  /**
   * Get rates for a property
   */
  async getRates(
    propertyId: string,
    startDate: string,
    endDate: string,
    roomTypeId?: string
  ): Promise<CloudbedsRate[]> {
    try {
      const params: any = {
        start_date: startDate,
        end_date: endDate,
      };
      if (roomTypeId) {
        params.room_type_id = roomTypeId;
      }

      const response = await this.apiClient.get(`/properties/${propertyId}/rates`, {
        params,
      });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch rates: ${error.message}`);
    }
  }

  /**
   * Create a booking
   */
  async createBooking(bookingData: {
    property_id: string;
    guest_name: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    room_type_id: string;
    referral_code?: string;
    notes?: string;
  }): Promise<CloudbedsBooking> {
    try {
      const notes = bookingData.referral_code
        ? `Referral Code: ${bookingData.referral_code}. ${bookingData.notes || ''}`
        : bookingData.notes || '';

      const payload = {
        property_id: bookingData.property_id,
        guest_name: bookingData.guest_name,
        guest_email: bookingData.guest_email,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        room_type_id: bookingData.room_type_id,
        notes,
      };

      const response = await this.apiClient.post('/bookings', payload);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<CloudbedsBooking> {
    try {
      const response = await this.apiClient.get(`/bookings/${bookingId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }
  }

  /**
   * Get bookings for a property
   */
  async getBookings(
    propertyId: string,
    filters?: {
      check_in?: string;
      check_out?: string;
      status?: string;
      referral_code?: string;
    }
  ): Promise<CloudbedsBooking[]> {
    try {
      const params: any = { property_id: propertyId };
      if (filters) {
        Object.assign(params, filters);
      }

      const response = await this.apiClient.get('/bookings', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  }

  /**
   * Extract referral code from booking notes
   */
  extractReferralCode(notes?: string): string | null {
    if (!notes) return null;

    const match = notes.match(/Referral Code:\s*([A-Za-z0-9]+)/i);
    return match ? match[1] : null;
  }

  /**
   * Register webhook URL with Cloudbeds
   */
  async registerWebhook(webhookUrl: string, events: string[]): Promise<void> {
    try {
      await this.apiClient.post('/webhooks', {
        url: webhookUrl,
        events,
      });
    } catch (error: any) {
      throw new Error(`Failed to register webhook: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature (if Cloudbeds provides it)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    // Implement signature validation if Cloudbeds provides webhook signatures
    // For now, return true (implement based on Cloudbeds documentation)
    return true;
  }
}

// Export singleton instance
export const cloudbedsService = new CloudbedsService();




