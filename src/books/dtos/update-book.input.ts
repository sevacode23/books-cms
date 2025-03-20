import { Field, ID, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

import { CreateBookInput } from './create-book.input';

/**
 * Input type for updating a book
 * Removes authorIds field from CreateBookInput and makes all remaining fields optional
 */
@InputType()
export class UpdateBookInput extends PartialType(
  OmitType(CreateBookInput, ['authorIds'] as const),
) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
