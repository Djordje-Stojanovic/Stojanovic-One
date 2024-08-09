import api from './api';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await api.post('/auth/token', data);
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};