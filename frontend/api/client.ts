import axios, { AxiosRequestConfig } from 'axios';
import { authClient } from '../utils/auth-client';
import { Platform } from 'react-native';
import { apiUrl } from '@/utils/envconfig';

const getBaseURL = () => {
  if (Platform.OS === "android") {
    return "http://10.122.155.125:3000";
  }
  return "http://localhost:3000";
};

const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: enables cookies/credentials
});

// Add interceptors for auth
apiClient.interceptors.request.use(async (config) => {
  const session = await authClient.getSession();
  if (session?.data?.session?.token) {
    config.headers.Authorization = `Bearer ${session.data.session.token}`;
  }
  return config;
});

// Custom mutator for orval to use our configured axios instance
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return apiClient.request<T>(config).then(({ data }) => data);
};

export default customInstance;
