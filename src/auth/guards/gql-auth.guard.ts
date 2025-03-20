import { IRequestContext } from '@/common/types';
import { Reflector } from '@nestjs/core';
import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

import { IJwtAuthUserRequest } from '@/common/types';

/** JWT authentication guard for GraphQL resolvers */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext): IJwtAuthUserRequest {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }

    const gqlContext = GqlExecutionContext.create(context);

    return gqlContext.getContext<IRequestContext>().req;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

export const UseGqlAuthGuard = () => UseGuards(GqlAuthGuard);

/**
 * Request param decorator that extracts the current authenticated JWT payload from GraphQL context
 * To be used in GraphQL resolvers for extracting the authenticated user
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext<IRequestContext>().req.user;
  },
);
