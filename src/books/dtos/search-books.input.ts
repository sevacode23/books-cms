import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min, IsISBN } from 'class-validator';

/**
 * All filterable fields for books.
 */
@InputType()
export class BooksFilterInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  author?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  year?: number;

  @Field({ nullable: true })
  @IsISBN()
  @IsOptional()
  isbn?: string;
}

/**
 * Supported fields for sorting books.
 */
export enum BooksSortField {
  TITLE = 'title',
  PUBLISHED_AT = 'publishedAt',
  PAGE_COUNT = 'pageCount',
}
registerEnumType(BooksSortField, { name: 'BooksSortField' });

/**
 * Sorting direction: ASC or DESC.
 */
export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}
registerEnumType(SortOrderEnum, { name: 'SortOrderEnum' });

/**
 * Single sorting rule: field and direction.
 */
@InputType()
export class SortBooksInput {
  @Field(() => BooksSortField)
  field: BooksSortField;

  @Field(() => SortOrderEnum)
  order: SortOrderEnum;
}

/**
 * Main input for searching books: filters, sorting, pagination.
 */
@InputType()
export class SearchBooksInput {
  @Field(() => BooksFilterInput, { nullable: true })
  @IsOptional()
  filter?: BooksFilterInput;

  @Field(() => [SortBooksInput], { nullable: true })
  @IsOptional()
  sort?: SortBooksInput[];

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
