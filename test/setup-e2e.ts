import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/common/utils';

import { setupDynamoDBTables } from './setup-dynamodb';

let app: NestFastifyApplication;

beforeAll(async () => {
  // Create DynamoDB tables for tests
  await setupDynamoDBTables();

  // Create NestJS application for tests
  app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await setupApp(app);

  await app.listen(8080, '0.0.0.0');
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

export { app };
