import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDate } from 'graphql-scalars';

import { Book } from '@/books/entities/book.model';

/**
 * Author GraphQL object type
 */
@ObjectType()
export class Author {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field(() => GraphQLDate, { nullable: true })
  birthDate: Date;

  @Field(() => [Book])
  books: Book[];
}
