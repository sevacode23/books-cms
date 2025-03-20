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

  return {
    type: 'postgres',
    host: postgresConfig?.host,
    port: postgresConfig?.port,
    username: postgresConfig?.username,
    password: postgresConfig?.password,
    database: postgresConfig?.database,
    synchronize: false,
    entities: [UserEntity, BookEntity, AuthorEntity],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsRun: true,
    migrationsTableName: 'migrations',
  };
};
