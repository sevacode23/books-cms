import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsISBN,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  @Length(1, 255)
  title: string;

  @Field()
  @IsString()
  @IsISBN()
  isbn: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  @Type(() => Date)
  publishedAt: Date;

  @Field()
  @IsString()
  @Length(1, 50)
  language: string;

  @Field(() => Int)
  @IsInt()
  pageCount: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  authorIds?: string[];
}
