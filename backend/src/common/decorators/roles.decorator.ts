import { SetMetadata } from '@nestjs/common';
import { Role } from '../types/enums';

export const ROLES_KEY = 'roles';

/**
 * Décorateur pour restreindre l'accès à un ou plusieurs rôles.
 * À combiner avec JwtAuthGuard et RolesGuard.
 *
 * @example @Roles(Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
