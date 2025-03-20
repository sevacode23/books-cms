import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FindReviewsInput {
  @Field(() => String, { nullable: true })
  bookId?: string;
}
