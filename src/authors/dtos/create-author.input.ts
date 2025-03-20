import { IsDate, IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { GraphQLDate } from 'graphql-scalars';
@InputType()
export class CreateAuthorInput {
  @Field()
  @IsString()
  fullName: string;

  @Field(() => GraphQLDate, { nullable: true })
  @IsDate()
  @IsOptional()
  birthDate?: Date;
}
