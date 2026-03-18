import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../../common/types/jwt-user.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtUser;
  },
);
