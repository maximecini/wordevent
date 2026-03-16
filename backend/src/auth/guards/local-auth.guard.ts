import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard Local — valide les identifiants email/password via Passport.
 * Utilisé uniquement sur la route POST /auth/login.
 *
 * @example @UseGuards(LocalAuthGuard)
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
