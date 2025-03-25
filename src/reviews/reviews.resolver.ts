import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { IJwtAuthUser } from '@/common/types';
import { ActivityLog } from '@/activity-logs/interceptors/activity-log.interceptor';
import { Book } from '@/books/entities/book.model';
import { BooksService } from '@/books/services/books.service';
import { CurrentUser, UseGqlAuthGuard } from '@/auth/guards/gql-auth.guard';

import { ReviewsService } from './services/reviews.service';
import { Review } from './entities/review.model';
import { CreateReviewInput } from './dtos/create-review.input';

/** Reviews resolver */
@Resolver(() => Review)
export class ReviewsResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly booksService: BooksService,
  ) {}

  /** ResolveField: Resolves the book field */
  @ResolveField('book', () => Book, { nullable: true })
  async getBook(@Parent() review: Review) {
    return this.booksService.findOneById(review.bookId);
  }

  /** Query: Gets all reviews for a book by book ID */
  @Query(() => [Review], { name: 'bookReviews', nullable: true })
  @ActivityLog('GET_REVIEWS_BY_BOOK')
  async getReviewsByBook(@Args('bookId') bookId: string) {
    return this.reviewsService.findByBook(bookId);
  }

  /** Mutation: Creates a new review */
  @Mutation(() => Review)
  @ActivityLog('CREATE_REVIEW')
  @UseGqlAuthGuard()
  async createReview(
    @Args('input') review: CreateReviewInput,
    @CurrentUser() user: IJwtAuthUser,
  ) {
    return this.reviewsService.createReview(review, user.id);
  }
}
