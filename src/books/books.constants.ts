export const BOOKS_CACHE = {
  REFIX: 'books',
  BOOK_PREFIX: 'book',
  SEARCH_BOOKS_PREFIX: 'search',
  BOOK_TTL: 30 * 60, // 30 minutes
  SEARCH_BOOKS_TTL: 15 * 60, // 15 minutes
  SEARCH_BOOKS_MAX: 500, // max number of results to cache
} as const;
