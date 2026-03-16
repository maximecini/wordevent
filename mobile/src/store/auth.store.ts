import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/user.types';
import { AuthTokens } from '../types/auth.types';
import { getMe } from '../api/endpoints/auth.api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  /** Stocke les tokens dans SecureStore et charge le profil utilisateur. */
  login: async (tokens: AuthTokens) => {
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    const user = await getMe();
    set({ user, accessToken: tokens.accessToken, isAuthenticated: true });
  },

  /** Supprime les tokens et réinitialise l'état d'authentification. */
  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  /** Restaure la session depuis SecureStore au démarrage de l'app. */
  restore: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;
    try {
      const user = await getMe();
      set({ user, accessToken: token, isAuthenticated: true });
    } catch {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },
}));
