import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

// Profiles API
export const profiles = {
  getAll: async () => {
    const response = await api.get('/profiles');
    return response.data;
  },
  
  create: async (profileUrl, label) => {
    const response = await api.post('/profiles', { profileUrl, label });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/profiles/${id}`);
    return response.data;
  }
};

// Posts API
export const posts = {
  refresh: async () => {
    const response = await api.post('/posts/refresh');
    return response.data;
  },
  
  getLatest: async (hours = 24, profileId = null) => {
    const params = new URLSearchParams({ hours: hours.toString() });
    if (profileId) {
      params.append('profileId', profileId);
    }
    const response = await api.get(`/posts/latest?${params.toString()}`);
    return response.data;
  }
};

export default api;