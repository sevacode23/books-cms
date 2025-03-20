import * as dotenv from 'dotenv';

dotenv.config();

export interface IPostgresConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface IRedisConfig {
  host?: string;
  port?: number;
}

export interface IDynamoDbTables {
  activityLogs?: string;
  reviews?: string;
}

export interface IDynamoDbConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  tables?: IDynamoDbTables;
}

export interface IJwtConfig {
  secret?: string;
}

export interface ICacheConfig {
  ttl: number;
}

export interface IThrottlerConfig {
  ttl: number;
  limit: number;
}

export interface IConfig {
  postgres: IPostgresConfig;
  dynamoDb: IDynamoDbConfig;
  redis: IRedisConfig;
  jwt: IJwtConfig;
  cache: ICacheConfig;
  throttler: IThrottlerConfig;
}

export const config = (): IConfig => ({
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },

  dynamoDb: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

    tables: {
      activityLogs: process.env.DYNAMODB_TABLE_ACTIVITY_LOGS,
      reviews: process.env.DYNAMODB_TABLE_REVIEWS,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET,
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '600'), // seconds
  },

  throttler: {
    ttl: parseInt(process.env.THROTTLER_TTL || '60000'), // milliseconds
    limit: parseInt(process.env.THROTTLER_LIMIT || '50'),
  },
});
