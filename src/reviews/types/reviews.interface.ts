export interface IReview extends Record<string, unknown> {
  reviewId: string;
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: number;
}
