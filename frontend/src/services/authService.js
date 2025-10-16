import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(name, email, password, role) {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async getProfile(token) {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }
};
