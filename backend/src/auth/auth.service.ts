import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Vérifie les identifiants email/password d'un utilisateur.
   *
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe en clair à comparer
   * @returns Utilisateur complet si valide, null sinon
   */
  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.password) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  /**
   * Inscrit un nouvel utilisateur et retourne ses tokens JWT.
   *
   * @param dto - Données d'inscription (email, password, name)
   * @returns Paire de tokens (accessToken, refreshToken)
   */
  async register(dto: CreateUserDto) {
    const user = await this.users.create(dto);
    return this.generateTokens(user.id);
  }

  /**
   * Génère de nouveaux tokens pour un utilisateur déjà authentifié.
   *
   * @param userId - UUID de l'utilisateur
   * @returns Paire de tokens (accessToken, refreshToken)
   */
  async login(userId: string) {
    return this.generateTokens(userId);
  }

  /**
   * Échange un refresh token valide contre une nouvelle paire de tokens.
   *
   * @param userId - UUID de l'utilisateur
   * @param refreshToken - Refresh token brut à valider
   * @returns Nouvelle paire de tokens (accessToken, refreshToken)
   * @throws UnauthorizedException si le token est invalide ou expiré
   */
  async refresh(userId: string, refreshToken: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();

    const fullUser = await this.users.findByEmail((user as any).email);
    if (!fullUser?.refreshToken) throw new UnauthorizedException();

    const matches = await bcrypt.compare(refreshToken, fullUser.refreshToken);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    return this.generateTokens(userId);
  }

  private async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub: userId }, { expiresIn: '15m' }),
      this.jwt.signAsync({ sub: userId }, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    await this.users.updateRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }
}
