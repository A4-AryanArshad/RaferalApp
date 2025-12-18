import api from './api';

export interface Reward {
  _id: string;
  type: 'cash' | 'free_night' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'validated' | 'paid' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface RewardBalance {
  totalEarned: number;
  pending: number;
  paid: number;
  currency: string;
}

export interface RewardMilestones {
  completedBookings: number;
  nextMilestone: number;
  freeNightsEarned: number;
}

export const rewardApi = {
  getBalance: async (): Promise<RewardBalance> => {
    const response = await api.get('/rewards/balance');
    return response.data.balance as RewardBalance;
  },

  getHistory: async (): Promise<Reward[]> => {
    // Only points-based (bonus) rewards
    const response = await api.get('/rewards/history?type=bonus');
    return response.data.rewards as Reward[];
  },

  getMilestones: async (): Promise<RewardMilestones> => {
    const response = await api.get('/rewards/milestones');
    return response.data.milestones as RewardMilestones;
  },
};



