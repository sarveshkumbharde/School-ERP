import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle session expiries
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 Unauthorized, we can clear local storage or redirect if necessary
    if (error.response && error.response.status === 401) {
      // Clean up token if stored in local storage
      localStorage.removeItem('isAuthenticated');
    }
    return Promise.reject(error);
  }
);

export default api;
