export type Role = 'USER' | 'ADMIN';
export type Provider = 'LOCAL' | 'GOOGLE' | 'APPLE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  provider: Provider;
}
