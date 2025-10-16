import api from './api';

export const assessmentService = {
  async getAssessments() {
    try {
      const response = await api.get('/assessments');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assessments');
    }
  },

  async getAssessment(id) {
    try {
      const response = await api.get(`/assessments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assessment');
    }
  },

  async submitAssessment(id, answers) {
    try {
      const response = await api.post(`/assessments/${id}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit assessment');
    }
  },

  async getResults() {
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch results');
    }
  },

  async getSkillAnalysis() {
    try {
      const response = await api.get('/skills/analysis');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch skill analysis');
    }
  },

  async getLeaderboard() {
    try {
      const response = await api.get('/leaderboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
};
