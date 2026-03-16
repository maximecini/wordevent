import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import { AppleAuthService } from './services/apple-auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppleAuthDto } from './dto/apple-auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly googleAuth: GoogleAuthService,
    private readonly appleAuth: AppleAuthService,
  ) {}

  /**
   * Inscrit un nouvel utilisateur avec email et mot de passe.
   *
   * @param dto - Données d'inscription
   * @returns Paire de tokens JWT (accessToken, refreshToken)
   */
  @ApiOperation({ summary: 'Inscription email/password' })
  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.auth.register(dto);
  }

  /**
   * Connecte un utilisateur avec email et mot de passe.
   *
   * @returns Paire de tokens JWT (accessToken, refreshToken)
   */
  @ApiOperation({ summary: 'Connexion email/password' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _dto: LoginDto, @Req() req: any) {
    return this.auth.login(req.user.id);
  }

  /**
   * Échange un refresh token contre une nouvelle paire de tokens.
   *
   * @param dto - Refresh token à valider
   * @returns Nouvelle paire de tokens JWT
   */
  @ApiOperation({ summary: 'Rafraîchir le token' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: any) {
    return this.auth.refresh(req.user?.id, dto.refreshToken);
  }

  /**
   * Connecte ou crée un compte via un idToken Google (Expo).
   *
   * @param dto - idToken obtenu depuis Expo Auth Session
   * @returns Paire de tokens JWT
   */
  @ApiOperation({ summary: 'Connexion via Google (idToken Expo)' })
  @Post('google')
  async googleLogin(@Body() dto: GoogleAuthDto) {
    const user = await this.googleAuth.verifyAndGetUser(dto.idToken);
    return this.auth.login(user.id);
  }

  /**
   * Connecte ou crée un compte via Apple Sign In (Expo).
   *
   * @param dto - identityToken et fullName (premier login uniquement)
   * @returns Paire de tokens JWT
   */
  @ApiOperation({ summary: 'Connexion via Apple Sign In (identityToken Expo)' })
  @Post('apple')
  async appleLogin(@Body() dto: AppleAuthDto) {
    const user = await this.appleAuth.verifyAndGetUser(dto.identityToken, dto.fullName);
    return this.auth.login(user.id);
  }

  /**
   * Retourne le profil de l'utilisateur actuellement connecté.
   *
   * @returns Profil public de l'utilisateur (sans password ni refreshToken)
   */
  @ApiOperation({ summary: 'Profil utilisateur connecté' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: any) {
    return user;
  }
}
