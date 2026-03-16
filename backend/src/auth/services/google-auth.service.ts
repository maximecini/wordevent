import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../../users/users.service';
import { Provider } from '@prisma/client';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  private getClient(): OAuth2Client {
    if (!this.client) {
      const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
      this.client = new OAuth2Client(clientId);
    }
    return this.client;
  }

  /**
   * Vérifie un idToken Google et retourne l'utilisateur correspondant.
   * Crée le compte si c'est la première connexion Google.
   *
   * @param idToken - Token d'identité Google obtenu via Expo
   * @returns Utilisateur existant ou nouvellement créé
   * @throws UnauthorizedException si le token est invalide ou malformé
   */
  async verifyAndGetUser(idToken: string) {
    const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const ticket = await this.getClient().verifyIdToken({
      idToken,
      audience: clientId,
    }).catch(() => {
      throw new UnauthorizedException('Invalid Google token');
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new UnauthorizedException('Invalid Google token payload');

    return this.users.findOrCreateOAuth(
      payload.email,
      payload.name ?? payload.email,
      Provider.GOOGLE,
      payload.sub,
    );
  }
}
