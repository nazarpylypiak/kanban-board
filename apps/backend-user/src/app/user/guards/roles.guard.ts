import { IUser } from '@kanban-board/shared';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user: IUser | undefined = request.user;
    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
