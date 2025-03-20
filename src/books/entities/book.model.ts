import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTimeISO } from 'graphql-scalars';

import { Author } from '@/authors/entities/author.model';

/**
 * Book GraphQL object type
 */
@ObjectType()
export class Book {
  @Field(() => ID)
  id: string;

  @Field()
  isbn: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => GraphQLDateTimeISO)
  publishedAt: Date;

  @Field()
  language: string;

  @Field(() => Int)
  pageCount: number;

  @Field(() => [Author])
  authors: Author[];
}
