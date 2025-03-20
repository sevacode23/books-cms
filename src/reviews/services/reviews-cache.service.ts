import { Injectable } from '@nestjs/common';

import { CacheService } from '@/core/cache/services/cache.service';

import { REVIEWS_CACHE } from '../reviews.constants';
import { IReview } from '../types/reviews.interface';

@Injectable()
export class ReviewsCacheService {
  constructor(private readonly cacheService: CacheService) {}

  /** Generates a cache key for reviews by ID */
  generateByIdKey(id: string) {
    return `${REVIEWS_CACHE.PREFIX}:${REVIEWS_CACHE.BY_ID_PREFIX}:${id}`;
  }

  /** Generates a cache key for reviews by book ID */
  generateByBookKey(bookId: string) {
    return `${REVIEWS_CACHE.PREFIX}:${REVIEWS_CACHE.BY_BOOK_PREFIX}:${bookId}`;
  }

  /** Gets review by ID */
  getById(id: string) {
    const key = this.generateByIdKey(id);

    return this.cacheService.get<IReview>(key);
  }

  /** Sets review by ID */
  setById(id: string, review: IReview) {
    const key = this.generateByIdKey(id);

    return this.cacheService.set(key, review, REVIEWS_CACHE.BY_ID_TTL);
  }

  /** Clears review by ID */
  clearById(id: string) {
    const key = this.generateByIdKey(id);

    return this.cacheService.del(key);
  }

  /** Gets reviews for a specific book */
  getByBook(bookId: string) {
    const key = this.generateByBookKey(bookId);

    return this.cacheService.get<IReview[]>(key);
  }

  /** Sets reviews by book ID */
  setByBook(bookId: string, reviews: IReview[]) {
    const key = this.generateByBookKey(bookId);

    return this.cacheService.set(key, reviews, REVIEWS_CACHE.BY_BOOK_TTL);
  }

  /** Clears reviews by book ID */
  clearByBook(bookId: string) {
    const key = this.generateByBookKey(bookId);

    return this.cacheService.del(key);
  }

  /** Clears all reviews */
  clear() {
    return this.cacheService.delByPattern(`${REVIEWS_CACHE.PREFIX}:*`);
  }
}
