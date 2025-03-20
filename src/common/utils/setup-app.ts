import { ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { fastifyHelmet } from '@fastify/helmet';

import { AllExceptionsFilter } from '../filters';

/**
 * Config NestJS application for different environments
 * @param app - NestFastifyApplication instance
 */
export const setupApp = async (app: NestFastifyApplication) => {
  // Helmet plugin to protect against web vulnerabilities
  await app.register(fastifyHelmet, {
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' ? undefined : false,
  });

  // Validation pipe to validate incoming requests
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global filter to handle all exceptions
  app.useGlobalFilters(new AllExceptionsFilter());
};
