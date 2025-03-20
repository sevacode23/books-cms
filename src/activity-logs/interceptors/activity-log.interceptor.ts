import {
  SetMetadata,
  applyDecorators,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import {
  ExecutionContext,
  CallHandler,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, mergeMap } from 'rxjs/operators';

import { IRequestContext } from '@/common/types';

import { ActivityLogsService } from '../services/activity-logs.service';
import { Observable } from 'rxjs';

/** Metadata for passing action to interceptor */
export const ACTIVITY_LOG_METADATA = 'activity_log_action';

/** Interceptor for automatically logging user actions */
@Injectable()
export class ActivityLogInterceptor<T> implements NestInterceptor {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  private readonly logger = new Logger(ActivityLogInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<T> | Promise<Observable<T>> {
    if (context.getType<GqlContextType>() !== 'graphql') {
      return next.handle();
    }

    const ctx = GqlExecutionContext.create(context);

    const { user } = ctx.getContext<IRequestContext>().req;

    if (!user) {
      return next.handle();
    }

    const action = Reflect.getMetadata(
      ACTIVITY_LOG_METADATA,
      context.getHandler(),
    ) as string;

    const variables: Record<string, unknown> = ctx.getArgs();

    return next.handle().pipe(
      mergeMap(async (result: T) => {
        try {
          await this.activityLogsService.createLog(user.id, action, variables);
        } catch (error) {
          this.logger.error(`Failed to log action: ${action}`, error);
        }

        return result;
      }),

      catchError((error) => {
        this.logger.error(`GraphQL resolver error: ${action}`, error);
        throw error;
      }),
    );
  }
}

/** Decorator for logging actions in GraphQL */
export function ActivityLog(action: string) {
  return applyDecorators(
    SetMetadata(ACTIVITY_LOG_METADATA, action),
    UseInterceptors(ActivityLogInterceptor),
  );
}
