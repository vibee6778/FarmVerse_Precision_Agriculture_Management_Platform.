import { apiFetch } from './apiClient';

export const yieldService = {
  getYieldPredictions: async () => {
    try {
      const res = await apiFetch('/yield-predictions');
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch yield predictions:', err);
      return [];
    }
  },

  createYieldPrediction: async (predictionData) => {
    try {
      const res = await apiFetch('/yield-predictions', {
        method: 'POST',
        body: JSON.stringify(predictionData),
      });
      if (!res.ok) throw new Error('Failed to save yield prediction');
      return await res.json();
    } catch (err) {
      console.error('Error saving yield prediction:', err);
      throw err;
    }
  },
};
