import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorsModule } from '@/authors/authors.module';
import { CacheModule } from '@/core/cache/cache.module';
import { ActivityLogsModule } from '@/activity-logs/activity-logs.module';

import { BooksService } from './services/books.service';
import { BooksQueryService } from './services/books-query.service';
import { BooksCacheService } from './services/books-cache.service';
import { BookEntity } from './entities/book.entity';

import { BooksResolver } from './book.resolver';
import { BooksLoader } from './books.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookEntity]),
    CacheModule,
    ActivityLogsModule,
    forwardRef(() => AuthorsModule),
  ],
  providers: [
    BooksService,
    BooksResolver,
    BooksQueryService,
    BooksCacheService,
    BooksLoader,
  ],
  exports: [BooksService, BooksLoader],
})
export class BooksModule {}
