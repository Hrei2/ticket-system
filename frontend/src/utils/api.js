import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) => 
  api.post('/auth/login', { username, password });

export const register = (username, password, role) => 
  api.post('/auth/register', { username, password, role });

export const getCurrentUser = () => 
  api.get('/auth/me');

export const getAllUsers = () => 
  api.get('/auth/users');

export const deleteUser = (id) => 
  api.delete(`/auth/users/${id}`);

// Tickets
export const createTicket = (ticketData) => 
  api.post('/tickets', ticketData);

export const getAllTickets = (filters = {}) => 
  api.get('/tickets', { params: filters });

export const getTicket = (ticketNumber) => 
  api.get(`/tickets/${ticketNumber}`);

export const getTicketStats = () => 
  api.get('/tickets/stats/summary');

// Scanner
export const scanTicket = (ticketNumber) => 
  api.post(`/scanner/scan/${ticketNumber}`);

export const validateTicket = (ticketNumber) => 
  api.get(`/scanner/validate/${ticketNumber}`);

// Admin
export const updateTicket = (id, updates) => 
  api.put(`/admin/tickets/${id}`, updates);

export const deleteTicket = (id) => 
  api.delete(`/admin/tickets/${id}`);

export const getTicketHistory = (id) => 
  api.get(`/admin/tickets/${id}/history`);

export const getAllHistory = (limit) => 
  api.get('/admin/history', { params: { limit } });

// Settings
export const getSettings = () => 
  api.get('/settings');

export const updateSettings = (settings) => 
  api.put('/settings', settings);

export default api;
