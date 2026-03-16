import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Provider } from '@prisma/client';

interface FacebookDebugResponse {
  data: {
    is_valid: boolean;
    app_id: string;
    user_id: string;
    error?: { message: string };
  };
}

interface FacebookMeResponse {
  id: string;
  name: string;
  email?: string;
}

@Injectable()
export class FacebookAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  private buildAppAccessToken(): string {
    const appId = this.config.getOrThrow<string>('FACEBOOK_APP_ID');
    const appSecret = this.config.getOrThrow<string>('FACEBOOK_APP_SECRET');
    return `${appId}|${appSecret}`;
  }

  private async verifyToken(accessToken: string): Promise<string> {
    const appAccessToken = this.buildAppAccessToken();
    const url = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;
    const res = await fetch(url);
    const json = (await res.json()) as FacebookDebugResponse;

    if (!json.data?.is_valid) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const expectedAppId = this.config.getOrThrow<string>('FACEBOOK_APP_ID');
    if (json.data.app_id !== expectedAppId) {
      throw new UnauthorizedException('Facebook token app mismatch');
    }

    return json.data.user_id;
  }

  private async getUserInfo(accessToken: string): Promise<FacebookMeResponse> {
    const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new UnauthorizedException('Failed to fetch Facebook user info');
    return (await res.json()) as FacebookMeResponse;
  }

  /**
   * Vérifie un access token Facebook et retourne l'utilisateur correspondant.
   * Crée le compte si c'est la première connexion Facebook.
   *
   * @param accessToken - Token d'accès Facebook obtenu via Expo Auth Session
   * @returns Utilisateur existant ou nouvellement créé
   * @throws UnauthorizedException si le token est invalide ou ne correspond pas à l'app
   */
  async verifyAndGetUser(accessToken: string) {
    const facebookId = await this.verifyToken(accessToken);
    const userInfo = await this.getUserInfo(accessToken);

    const email = userInfo.email ?? `fb_${facebookId}@wordevent.local`;
    const name = userInfo.name ?? email.split('@')[0];

    return this.users.findOrCreateOAuth(email, name, Provider.FACEBOOK, facebookId);
  }
}
