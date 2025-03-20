import { IRequestContext } from '@/common/types';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const contextType = context.getType<GqlContextType>();

    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);

      const ctx = gqlCtx.getContext<IRequestContext>();

      return { req: ctx.req, res: ctx.res };
    }

    return super.getRequestResponse(context);
  }
}
