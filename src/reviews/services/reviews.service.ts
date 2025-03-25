import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { parseDynamoDBItems } from '@/common/utils';
import { InjectDynamoDB } from '@/core/dynamodb/decorators/inject-dynamodb';
import { BooksService } from '@/books/services/books.service';

import { CreateReviewInput } from '../dtos/create-review.input';
import { ReviewsCacheService } from './reviews-cache.service';
import { IReview } from '../types/reviews.interface';

/** Service for managing reviews */
@Injectable()
export class ReviewsService {
  private readonly tableName: string;

  constructor(
    // Inject DynamoDB client and config service
    @InjectDynamoDB() private readonly dynamoDb: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
    // Inject reviews cache service, books service
    private readonly reviewsCacheService: ReviewsCacheService,
    private readonly booksService: BooksService,
  ) {
    // Get reviews table name from config
    this.tableName = this.configService.get<string>(
      'dynamoDb.tables.reviews',
      'DEFAULT_REVIEWS_TABLE',
    );
  }

  /** Gets all reviews by book ID */
  async findByBook(bookId: string) {
    const reviews = await this.reviewsCacheService.getByBook(bookId);

    if (reviews) {
      return reviews;
    }

    const result = await this.dynamoDb.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'bookId-index',
        KeyConditionExpression: 'bookId = :bookId',
        ExpressionAttributeValues: { ':bookId': { S: bookId } },
      }),
    );

    const parsedReviews = result.Items
      ? parseDynamoDBItems<IReview>(result.Items)
      : [];

    await this.reviewsCacheService.setByBook(bookId, parsedReviews);

    return parsedReviews;
  }

  /** Creates a new review */
  async createReview(review: CreateReviewInput, userId: string) {
    // If book not found, throw error
    const book = await this.booksService.findOneById(review.bookId);

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Generate unique review ID
    const reviewId = uuidv4();

    const reviewItem = {
      reviewId,
      userId,
      bookId: review.bookId,
      rating: review.rating,
      comment: review.comment,
      timestamp: Date.now(),
    };

    await Promise.all([
      this.reviewsCacheService.clearByBook(review.bookId),

      this.dynamoDb.send(
        new PutCommand({
          TableName: this.tableName,
          Item: reviewItem,
        }),
      ),
    ]);

    return reviewItem;
  }
}
