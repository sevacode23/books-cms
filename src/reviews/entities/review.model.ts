import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTimeISO } from 'graphql-scalars';

import { Book } from '@/books/entities/book.model';

/** Review GraphQL object type */
@ObjectType()
export class Review {
  @Field(() => String)
  reviewId: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  comment: string;

  @Field(() => GraphQLDateTimeISO)
  timestamp: Date;

  @Field(() => String)
  bookId: string;

  @Field(() => String)
  userId: string;

  @Field(() => Book)
  book: Book;
}
