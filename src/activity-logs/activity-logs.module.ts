import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DynamoDBModule } from '@/core/dynamodb/dynamodb.module';

import { ActivityLogInterceptor } from './interceptors/activity-log.interceptor';
import { ActivityLogsService } from './services/activity-logs.service';

/** Activity logs module */
@Global()
@Module({
  imports: [DynamoDBModule, ConfigModule],
  providers: [ActivityLogsService, ActivityLogInterceptor],
  exports: [ActivityLogsService, ActivityLogInterceptor],
})
export class ActivityLogsModule {}
