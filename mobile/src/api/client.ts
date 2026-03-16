import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4443/api';

export const apiClient = axios.create({ baseURL: API_URL, timeout: 10000 });

/** Injecte le JWT dans chaque requête sortante. */
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Rafraîchit le token sur 401, affiche un toast sur toute autre erreur. */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original.url?.includes('/auth/login') || original.url?.includes('/auth/register');

    console.log('[Intercepteur] erreur HTTP', {
      status: error.response?.status,
      url: original?.url,
      baseURL: original?.baseURL,
      isAuthRoute,
      _retry: original?._retry,
      responseData: error.response?.data,
      errorMessage: error.message,
    });

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      console.log('[Intercepteur] 401 non-auth → tentative refresh');
      original._retry = true;
      return refreshAndRetry(original);
    }
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message ?? 'Une erreur est survenue';
      Toast.show({ type: 'error', text1: 'Erreur', text2: message });
    }
    return Promise.reject(error);
  },
);

async function refreshAndRetry(originalRequest: any) {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  console.log('[refreshAndRetry] refreshToken trouvé :', !!refreshToken, '| url :', originalRequest?.url);
  if (!refreshToken) return Promise.reject(new Error('No refresh token'));

  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);

  originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
  return apiClient(originalRequest);
}
