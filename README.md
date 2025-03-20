# Books CMS

## Introduction

Books CMS is a high-performance content management system built with **NestJS** and **GraphQL**, designed for efficient handling of book data.

- Uses **Fastify** to optimize request handling and improve performance.
- Compiled with **SWC** for faster build times and execution.
- Utilizes **PostgreSQL, DynamoDB, and Redis** for scalable storage and caching.

## Prerequisites

To run this project, you need to have **Docker** installed. No other global dependencies are required.

- [Install Docker](https://www.docker.com/get-started)

## Environment Variables

Before running the project, create a `.env.development` file in the project root with the following content:

```ini
# PostgreSQL
POSTGRES_HOST=your_postgres_host
POSTGRES_PORT=your_postgres_port
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_database_name

# DynamoDB (AWS)
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
DYNAMODB_TABLE_ACTIVITY_LOGS=your_table_name
DYNAMODB_TABLE_REVIEWS=your_table_name

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port

# Throttling (Rate Limiting)
THROTTLER_TTL=60000
THROTTLER_LIMIT=100

# JWT Authentication
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Cache
CACHE_TTL=900000
```

This file contains example values. Replace them with your actual credentials before running the project.

## Running the Project

To start the project locally, use Docker Compose:

```sh
docker-compose up --build
```

This command will:

- Build and start the **NestJS server**.
- Launch **PostgreSQL** and **Redis** as supporting services.
- Connect to **AWS DynamoDB** using the provided credentials.

## API Access

Once the project is running, you can access:

- **API Server:** [http://localhost:8080](http://localhost:8080)
- **GraphQL Playground:** [http://localhost:8080/graphql](http://localhost:8080/graphql)

Use the GraphQL Playground to explore the API, execute queries, and test mutations.

### Authentication Endpoints

- **Sign Up:** `POST /auth/signup`
- **Login:** `POST /auth/login`

### GraphQL Default Endpoint

- **GraphQL API:** `POST /graphql`

## Database Migrations

The project uses **TypeORM** for database migrations.

Generate a new migration:

```sh
yarn migration:generate src/migrations/NewMigration
```

Run pending migrations:

```sh
yarn migration:run
```

Revert the last migration:

```sh
yarn migration:revert
```

## Project Dependencies

The project uses the following key dependencies:

- **Framework:** NestJS (Fastify)
- **GraphQL API:** Apollo Server + NestJS GraphQL
- **Database:** PostgreSQL (TypeORM), AWS DynamoDB
- **Cache:** Redis
- **Security:** JWT authentication, Throttling
- **Performance:** SWC for fast compilation

For a full list, check `package.json`.
