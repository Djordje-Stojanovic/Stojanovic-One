import { setAuthToken, clearAuthToken, login as apiLogin, register as apiRegister } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await apiLogin(data.email, data.password);
  setAuthToken(response.access_token);
  return response;
};

export const register = async (data: RegisterData) => {
  await apiRegister(data.email, data.password);
};

export const logout = () => {
  clearAuthToken();
};