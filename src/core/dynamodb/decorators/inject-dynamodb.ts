import { Inject } from '@nestjs/common';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const InjectDynamoDB = () => Inject(DynamoDBDocumentClient);
