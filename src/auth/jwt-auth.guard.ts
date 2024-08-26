import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      return super.canActivate(context) as boolean;
    }
  
    handleRequest(err, user, info) {
      if (err || !user) {
        throw err || new UnauthorizedException();
      }
      return user;
    }
  }