import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { config } from './common/config';

import { DatabaseModule } from '@/core/database/database.module';
import { DynamoDBModule } from '@/core/dynamodb/dynamodb.module';
import { AppGraphQLModule } from '@/core/graphql/app-graphql.module';
import { AppThrottlerModule } from '@/core/throttler/app-throttler.module';
import { CacheModule } from '@/core/cache/cache.module';

import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { BooksModule } from '@/books/books.module';
import { AuthorsModule } from '@/authors/authors.module';
import { ActivityLogsModule } from '@/activity-logs/activity-logs.module';
import { ReviewsModule } from '@/reviews/reviews.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),

    // GraphQL
    AppGraphQLModule,

    // Database modules
    DatabaseModule,
    DynamoDBModule,
    CacheModule,

    // Infrastructure modules
    AppThrottlerModule,

    // Feature modules
    UsersModule,
    AuthModule,
    BooksModule,
    AuthorsModule,
    ReviewsModule,
    ActivityLogsModule,
  ],
})
export class AppModule {}
