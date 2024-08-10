import axios, { AxiosError } from 'axios';
import { User } from '../types/user';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access');
      // You might want to dispatch a logout action or redirect to login page here
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const register = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateUserProfile = async (userData: Partial<User>) => {
  try {
    console.log('Sending update request:', userData);
    const response = await api.put('/users/me', userData);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      console.error('Detailed error:', errorData);
      throw new Error(JSON.stringify(errorData));
    }
    throw error;
  }
};

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const serverError = error as AxiosError<any>;
    if (serverError && serverError.response) {
      console.error('API Error:', serverError.response.data);
      throw new Error(serverError.response.data.detail || 'An unexpected error occurred');
    }
  }
  throw error;
};

export default api;