import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4443/api';

export const apiClient = axios.create({ baseURL: API_URL });

/** Injecte le JWT dans chaque requête sortante. */
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Rafraîchit le token automatiquement sur erreur 401. */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    return refreshAndRetry(original);
  },
);

async function refreshAndRetry(originalRequest: any) {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) return Promise.reject(new Error('No refresh token'));

  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);

  originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
  return apiClient(originalRequest);
}
