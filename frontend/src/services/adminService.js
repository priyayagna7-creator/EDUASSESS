import api from './api';

export const adminService = {
  async getAssessments() {
    try {
      const response = await api.get('/admin/assessments');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assessments');
    }
  },

  async createAssessment(assessmentData) {
    try {
      const response = await api.post('/admin/assessments', assessmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create assessment');
    }
  },

  async getUsers() {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  async getAnalytics() {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
};
