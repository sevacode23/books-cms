export const REVIEWS_CACHE = {
  PREFIX: 'reviews',
  BY_BOOK_TTL: 3 * 60 * 60, // 3 hours
  BY_BOOK_PREFIX: 'book',
  BY_ID_TTL: 5 * 60 * 60, // 5 hours
  BY_ID_PREFIX: 'id',
} as const;
