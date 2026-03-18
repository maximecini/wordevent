import { Role } from './enums';

export interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: Role;
  createdAt: Date;
}
