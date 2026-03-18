import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Valide le payload JWT et retourne l'utilisateur correspondant.
   * Appelé automatiquement par Passport après vérification de la signature.
   *
   * @param payload - Payload du JWT décodé contenant l'identifiant utilisateur
   * @returns Profil public de l'utilisateur
   * @throws UnauthorizedException si l'utilisateur n'existe plus en base
   */
  async validate(payload: { sub: string }) {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
