import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { IPostgresConfig } from '@/common/config/configuration';
import { UserEntity } from '@/users/entities/user.entity';
import { BookEntity } from '@/books/entities/book.entity';
import { AuthorEntity } from '@/authors/entities/author.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const postgresConfig = configService.get<IPostgresConfig>('postgres');

  const migrations =
    process.env.NODE_ENV === 'test'
      ? []
      : [__dirname + '/migrations/**/*{.ts,.js}'];
  const synchronize = process.env.NODE_ENV === 'test';
  const migrationsRun = process.env.NODE_ENV !== 'test';
  const migrationsTableName =
    process.env.NODE_ENV === 'test' ? undefined : 'migrations';

  return {
    type: 'postgres',
    host: postgresConfig?.host,
    port: postgresConfig?.port,
    username: postgresConfig?.username,
    password: postgresConfig?.password,
    database: postgresConfig?.database,
    entities: [UserEntity, BookEntity, AuthorEntity],
    synchronize,
    migrations,
    migrationsRun,
    migrationsTableName,
  };
};
