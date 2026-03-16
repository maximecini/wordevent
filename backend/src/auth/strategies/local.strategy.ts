import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * Valide les identifiants email/password.
   * Appelé automatiquement par Passport lors de la stratégie local.
   *
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe en clair
   * @returns Utilisateur authentifié
   * @throws UnauthorizedException si les identifiants sont invalides
   */
  async validate(email: string, password: string) {
    const user = await this.auth.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
