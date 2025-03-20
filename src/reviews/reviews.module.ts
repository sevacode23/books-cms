import { Module } from '@nestjs/common';

import { DynamoDBModule } from '@/core/dynamodb/dynamodb.module';
import { BooksModule } from '@/books/books.module';

import { ReviewsService } from './services/reviews.service';
import { ReviewsCacheService } from './services/reviews-cache.service';
import { ReviewsResolver } from './reviews.resolver';

/** Reviews module */
@Module({
  imports: [BooksModule, DynamoDBModule],
  providers: [ReviewsService, ReviewsCacheService, ReviewsResolver],
  exports: [ReviewsService],
})
export class ReviewsModule {}
