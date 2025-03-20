import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsUUID } from 'class-validator';

@InputType()
export class RemoveBookAuthorsInput {
  @Field()
  @IsUUID('4')
  id: string;

  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  authorIds: string[];
}
