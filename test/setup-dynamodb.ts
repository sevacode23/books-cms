import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  ResourceInUseException,
  CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set');
}

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function createTableIfNotExists(params: CreateTableCommandInput) {
  const existingTables = await client.send(new ListTablesCommand({}));

  if (!existingTables.TableNames?.includes(params.TableName!)) {
    try {
      await client.send(new CreateTableCommand(params));

      console.log(`Created DynamoDB table: ${params.TableName}`);
    } catch (error) {
      if (error instanceof ResourceInUseException) {
        console.log(`Table ${params.TableName} already exists.`);
      } else {
        throw error;
      }
    }
  } else {
    console.log(
      `Table ${params.TableName} already exists (checked via ListTables).`,
    );
  }
}

export async function setupDynamoDBTables() {
  await createTableIfNotExists({
    TableName: process.env.DYNAMODB_TABLE_ACTIVITY_LOGS!,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });

  await createTableIfNotExists({
    TableName: process.env.DYNAMODB_TABLE_REVIEWS!,
    KeySchema: [
      { AttributeName: 'reviewId', KeyType: 'HASH' },
      { AttributeName: 'bookId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'reviewId', AttributeType: 'S' },
      { AttributeName: 'bookId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'bookId-index',
        KeySchema: [{ AttributeName: 'bookId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });
}
