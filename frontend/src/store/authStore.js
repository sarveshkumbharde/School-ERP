import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user } = response.data.data;
      set({ user, isAuthenticated: true, loading: false, error: null });
      localStorage.setItem('isAuthenticated', 'true');
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: message, loading: false, isAuthenticated: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API failed, clearing local state anyway:', error);
    } finally {
      set({ user: null, isAuthenticated: false, loading: false, error: null });
      localStorage.removeItem('isAuthenticated');
    }
  },

  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data.data;
      set({ user, isAuthenticated: true, loading: false, error: null });
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
      localStorage.removeItem('isAuthenticated');
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
