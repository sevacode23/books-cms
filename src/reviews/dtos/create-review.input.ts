import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, Length } from 'class-validator';

/** Input type for creating review */
@InputType()
export class CreateReviewInput {
  @Field()
  @IsString()
  bookId: string;

  @Field(() => Int)
  @IsNumber()
  rating: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Length(1, 500)
  comment?: string;
}
