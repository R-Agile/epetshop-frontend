import api from '@/lib/api';
import { encryptData } from '@/lib/crypto';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    _id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Encrypt credentials before sending
    const encryptedData = encryptData(JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }));
    
    const response = await api.post<AuthResponse>('/users/login', {
      encrypted: encryptedData,
    });
    return response.data;
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/register', data);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
