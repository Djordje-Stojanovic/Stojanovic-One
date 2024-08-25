import axios, { AxiosError } from 'axios';
import { User } from '../types/user';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const register = async (email: string, password: string): Promise<void> => {
  await api.post('/auth/register', { email, password });
};

export const login = async (email: string, password: string): Promise<{ access_token: string }> => {
  const response = await api.post('/auth/token', { email, password });
  return response.data;
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put('/users/me', userData);
  return response.data;
};

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error) && error.response) {
    const errorMessage = (error.response.data as { detail?: string }).detail || 'An unexpected error occurred';
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }
  throw error;
};

export default api;