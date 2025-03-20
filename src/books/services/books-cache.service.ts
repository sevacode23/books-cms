import { Injectable } from '@nestjs/common';

import { CacheService } from '@/core/cache/services/cache.service';

import { BookEntity } from '../entities/book.entity';
import { BOOKS_CACHE } from '../books.constants';
import { SearchBooksInput } from '../dtos/search-books.input';

@Injectable()
export class BooksCacheService {
  constructor(private readonly cacheService: CacheService) {}

  /** Checks if search results should be cached
   *
   * Search result entities should be cached if:
   * - The number of results is less than or equal to the max
   * - The filter is not applied
   */
  private checkShouldCacheSearchBooks(
    input: SearchBooksInput,
    results: BookEntity[],
  ) {
    return (
      results.length <= BOOKS_CACHE.SEARCH_BOOKS_MAX &&
      input.filter === undefined
    );
  }

  /** Gets the prefix for the books cache */
  private getBookPrefix() {
    return `${BOOKS_CACHE.REFIX}:${BOOKS_CACHE.BOOK_PREFIX}:`;
  }

  /** Gets the search prefix */
  private getSearchPrefix() {
    return `${BOOKS_CACHE.REFIX}:${BOOKS_CACHE.SEARCH_BOOKS_PREFIX}:`;
  }

  /** Generates a cache key for a book by ID */
  private generateBookKey(id: string) {
    return this.getBookPrefix() + id;
  }

  /** Generates a cache key for a search books input
   * example key: sort=title.ASC-publishedAt.DESC&offset=0&limit=10
   */
  private generateSearchKey(input: SearchBooksInput) {
    const { sort, offset, limit } = input;

    let key = this.getSearchPrefix();
    const parts: string[] = [];

    // Apply sort key if sort is provided
    // add each sort item to the key
    // (title-ASC&author-DESC)
    if (sort?.length) {
      key += 'sort=';

      const sortPart = sort
        .map((sortItem) => `${sortItem.field}.${sortItem.order}`)
        .join('-');

      parts.push(sortPart);
    }

    // Apply offset key if offset is provided
    if (offset) {
      parts.push(`offset=${offset}`);
    }

    // Apply limit key if limit is provided
    if (limit) {
      parts.push(`limit=${limit}`);
    }

    key += parts.join('&');

    return key;
  }

  /** Removes relations from a book entity
   * They will be raised from GraphQL resolver,
   * so no need to cache them
   */
  private removeBookRelations(book: BookEntity) {
    const { authors, ...rest } = book;

    return rest;
  }

  /** Removes relations from a book entity array
   * They will be raised from GraphQL resolver,
   * so no need to cache them
   */
  private removeBookRelationsArray(books: BookEntity[]) {
    return books.map((book) => this.removeBookRelations(book));
  }

  /** Gets a book from cache by id */
  getOne(id: string) {
    const key = this.generateBookKey(id);

    return this.cacheService.get<BookEntity>(key);
  }

  /** Gets search results from cache by input
   *
   * @param input - The search books input
   * @returns Cached search results
   */
  getSearch(input: SearchBooksInput) {
    const key = this.generateSearchKey(input);

    return this.cacheService.get<BookEntity[]>(key);
  }

  /** Sets a book in cache by id */
  setOne(id: string, book: BookEntity) {
    const key = this.generateBookKey(id);

    const bookWithoutRelations = this.removeBookRelations(book);

    return this.cacheService.set(
      key,
      bookWithoutRelations,
      BOOKS_CACHE.BOOK_TTL,
    );
  }

  /** Clears a book from cache by id */
  clearOne(id: string) {
    const key = this.generateBookKey(id);

    return this.cacheService.del(key);
  }

  /** Check if search results should be cached by input
   * and cache them if so
   */
  cacheSearch(input: SearchBooksInput, results: BookEntity[]) {
    const isShouldCache = this.checkShouldCacheSearchBooks(input, results);

    if (!isShouldCache) {
      return;
    }

    const key = this.generateSearchKey(input);

    const resultsWithoutRelations = this.removeBookRelationsArray(results);

    return this.cacheService.set(
      key,
      resultsWithoutRelations,
      BOOKS_CACHE.SEARCH_BOOKS_TTL,
    );
  }

  /** Clears all search results cache */
  clearSearch() {
    return this.cacheService.delByPattern(this.getSearchPrefix() + '*');
  }

  /** Clears a book by id and search results from cache */
  clearOneWithSearch(id: string) {
    return Promise.all([this.clearOne(id), this.clearSearch()]);
  }

  /** Clears all books cache */
  clear() {
    return this.cacheService.delByPattern(BOOKS_CACHE.REFIX + ':*');
  }
}
