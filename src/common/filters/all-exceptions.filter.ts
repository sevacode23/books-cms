import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { FastifyReply, FastifyRequest } from 'fastify';
import { GraphQLError } from 'graphql';

/**
 * Global exception filter for HTTP and GraphQL contexts
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType<GqlContextType>();

    // HTTP context handling
    if (contextType === 'http') {
      const httpCtx = host.switchToHttp();
      const response = httpCtx.getResponse<FastifyReply>();
      const request = httpCtx.getRequest<FastifyRequest>();

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error';

      this.logger.error('HTTP exception thrown', {
        url: request.url,
        status,
        message,
      });

      response.code(status).send({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });

      return;
    }

    // GraphQL context handling
    if (contextType === 'graphql') {
      if (exception instanceof HttpException) {
        const statusCode = exception.getStatus();
        const errorResponse = exception.getResponse();

        const errorObj =
          typeof errorResponse === 'string'
            ? { message: errorResponse }
            : (errorResponse as Record<string, any>);

        this.logger.error('GraphQL HttpException thrown', {
          statusCode,
          errorObj,
        });

        throw new GraphQLError(
          (errorObj.message as string) || 'GraphQL HTTP exception',
          {
            extensions: {
              code: String(statusCode),
              ...errorObj,
            },
          },
        );
      } else {
        this.logger.error('GraphQL exception thrown', exception);

        const fallbackMessage =
          exception instanceof Error && exception.message
            ? exception.message
            : 'Internal server error';

        throw new GraphQLError(fallbackMessage, {
          extensions: {
            code: '500',
          },
        });
      }
    }

    // Fallback for unhandled context types
    this.logger.error('Unhandled context type in AllExceptionsFilter', {
      contextType,
      exception,
    });
  }
}
