import { apiClient } from '../client';
import { AuthTokens, LoginDto, RegisterDto } from '../../types/auth.types';
import { User } from '../../types/user.types';

/** Inscrit un nouvel utilisateur et retourne les tokens JWT. */
export async function register(dto: RegisterDto): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/register', dto);
  return data;
}

/** Connecte un utilisateur avec email/password et retourne les tokens JWT. */
export async function login(dto: LoginDto): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/login', dto);
  return data;
}

/** Connecte ou crée un compte via un idToken Google. */
export async function loginGoogle(idToken: string): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/google', { idToken });
  return data;
}

/** Connecte ou crée un compte via un identityToken Apple. */
export async function loginApple(identityToken: string, fullName?: string): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/apple', { identityToken, fullName });
  return data;
}

/** Connecte ou crée un compte via un accessToken Facebook. */
export async function loginFacebook(accessToken: string): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/facebook', { accessToken });
  return data;
}

/** Retourne le profil de l'utilisateur connecté. */
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}
