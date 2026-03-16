import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as appleSignin from 'apple-signin-auth';
import { UsersService } from '../../users/users.service';
import { Provider } from '@prisma/client';

@Injectable()
export class AppleAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  /**
   * Vérifie un identityToken Apple et retourne l'utilisateur correspondant.
   * Crée le compte si c'est la première connexion Apple.
   * Note : Apple ne fournit le fullName qu'au premier login.
   *
   * @param identityToken - Token d'identité Apple obtenu via Expo
   * @param fullName - Nom complet (disponible uniquement au premier login)
   * @returns Utilisateur existant ou nouvellement créé
   * @throws UnauthorizedException si le token est invalide ou malformé
   */
  async verifyAndGetUser(identityToken: string, fullName?: string) {
    const payload = await appleSignin.verifyIdToken(identityToken, {
      audience: this.config.getOrThrow<string>('APPLE_CLIENT_ID'),
      ignoreExpiration: false,
    }).catch(() => {
      throw new UnauthorizedException('Invalid Apple token');
    });

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Apple token payload');
    }

    const name = fullName ?? payload.email.split('@')[0];

    return this.users.findOrCreateOAuth(
      payload.email,
      name,
      Provider.APPLE,
      payload.sub,
    );
  }
}
