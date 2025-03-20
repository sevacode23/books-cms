import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { IDynamoDbConfig } from '@/common/config/configuration';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DynamoDBDocumentClient,
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const dynamoConfig = configService.get<IDynamoDbConfig>('dynamoDb');

        if (!dynamoConfig?.accessKeyId || !dynamoConfig?.secretAccessKey) {
          throw new Error('DynamoDB config is not set');
        }

        const client = new DynamoDBClient({
          region: dynamoConfig.region,

          credentials: {
            accessKeyId: dynamoConfig.accessKeyId,
            secretAccessKey: dynamoConfig.secretAccessKey,
          },
        });

        return DynamoDBDocumentClient.from(client);
      },
    },
  ],
  exports: [DynamoDBDocumentClient],
})
export class DynamoDBModule {}
