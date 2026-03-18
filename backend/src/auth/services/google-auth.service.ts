import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../../users/users.service';
import { Provider } from '../../common/types/enums';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client | null = null;

  constructor(private readonly users: UsersService) {}

  private getClient(): OAuth2Client {
    if (!this.client) {
      this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
    const clientId = process.env.GOOGLE_CLIENT_ID as string;
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
