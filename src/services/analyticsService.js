import { MOCK_ANALYTICS } from '../data/mockData';

export const analyticsService = {
  async getMetrics() {
    return MOCK_ANALYTICS;
  }
};
