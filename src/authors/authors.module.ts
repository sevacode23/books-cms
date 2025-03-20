import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BooksModule } from '@/books/books.module';
import { ActivityLogsModule } from '@/activity-logs/activity-logs.module';

import { AuthorEntity } from './entities/author.entity';
import { AuthorsService } from './services/authors.service';
import { AuthorsResolver } from './authors.resolver';
import { AuthorsLoader } from './authors.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorEntity]),
    ActivityLogsModule,
    forwardRef(() => BooksModule),
  ],
  providers: [AuthorsService, AuthorsResolver, AuthorsLoader],
  exports: [AuthorsService, AuthorsLoader],
})
export class AuthorsModule {}
