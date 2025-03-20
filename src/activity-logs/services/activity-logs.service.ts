import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

import { InjectDynamoDB } from '@/core/dynamodb/decorators/inject-dynamodb';

/** Service for managing activity logs */
@Injectable()
export class ActivityLogsService {
  private readonly tableName: string;
  private readonly logger: Logger;

  // Inject DynamoDB Document Client and Config Service
  constructor(
    @InjectDynamoDB() private readonly dynamoDb: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    // Set table name from config
    this.tableName = this.configService.get<string>(
      'dynamoDb.tables.activityLogs',
      '',
    );

    this.logger = new Logger(ActivityLogsService.name);
  }

  // Create a activity log
  async createLog(
    userId: string,
    action: string,
    params: Record<string, unknown>,
  ) {
    try {
      await this.dynamoDb.send(
        new PutCommand({
          TableName: this.tableName,
          Item: { userId, action, params, timestamp: Date.now() },
        }),
      );
    } catch (error) {
      this.logger.error(`Error creating activity log: ${error}`);
    }
  }

  // Get a activity log by id
  async getLogById(id: string) {
    try {
      const result = await this.dynamoDb.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id },
        }),
      );

      return result.Item;
    } catch (error) {
      this.logger.error(`Error getting activity log: ${error}`);
      return null;
    }
  }
}
