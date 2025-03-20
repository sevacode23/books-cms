import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { setupApp } from './common/utils';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Configure app for development/production environments
  await setupApp(app);

  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}

void bootstrap();
