import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

import { toTsQuery } from '@/common/utils';

import { BookEntity } from '../entities/book.entity';
import {
  BooksSortField,
  BooksFilterInput,
  SortBooksInput,
} from '../dtos/search-books.input';

/** Service for querying books */
@Injectable()
export class BooksQueryService {
  constructor() {}

  /** Applies filters to the query
   * @param qb - The query builder to apply the filters to
   * @param filter - The filter options to apply to the query
   */
  public applyFilters(
    qb: SelectQueryBuilder<BookEntity>,
    filter?: BooksFilterInput,
  ) {
    if (!filter) {
      return;
    }

    const { title, author, isbn, year } = filter;

    // Full-text search for title
    if (title) {
      const titleQuery = toTsQuery(title);

      qb.andWhere(
        `to_tsvector('english', book.title) @@ to_tsquery('english', :titleQuery)`,
        { titleQuery },
      );
    }

    // Full-text search for author's full name
    if (author) {
      const authorQuery = toTsQuery(author);

      qb.andWhere(
        `to_tsvector('english', author.fullName) @@ to_tsquery('english', :authorQuery)`,
        { authorQuery },
      );
    }

    // Exact match on ISBN
    if (isbn) {
      qb.andWhere('book.isbn = :isbn', { isbn });
    }

    if (year) {
      // Filter by year range (Jan 1 to Dec 31)
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      qb.andWhere('book.publishedAt >= :startDate', { startDate });
      qb.andWhere('book.publishedAt < :endDate', { endDate });
    }
  }

  /** Applies sorting to the query
   * @param qb - The query builder to apply the sorting to
   * @param sort - The sorting options to apply to the query
   */
  public applySorting(
    qb: SelectQueryBuilder<BookEntity>,
    sort?: SortBooksInput[],
  ) {
    if (!sort || !sort.length) {
      qb.addOrderBy('book.title', 'ASC');
      return;
    }

    for (const sortItem of sort) {
      switch (sortItem.field) {
        case BooksSortField.TITLE:
          qb.addOrderBy('book.title', sortItem.order);
          break;

        case BooksSortField.PUBLISHED_AT:
          qb.addOrderBy('book.publishedAt', sortItem.order);
          break;

        case BooksSortField.PAGE_COUNT:
          qb.addOrderBy('book.pageCount', sortItem.order);
          break;

        default:
          break;
      }
    }
  }

  /** Applies pagination to the query
   * @param qb - The query builder to apply the pagination to
   * @param offset - The offset to apply to the query
   * @param limit - The limit to apply to the query
   */
  public applyPagination(
    qb: SelectQueryBuilder<BookEntity>,
    offset?: number,
    limit?: number,
  ) {
    if (offset !== undefined) {
      qb.skip(offset);
    }

    if (limit !== undefined) {
      qb.take(limit);
    }
  }
}
