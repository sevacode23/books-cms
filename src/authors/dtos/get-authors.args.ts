import { ArgsType, Field, GraphQLISODateTime } from '@nestjs/graphql';

@ArgsType()
export class GetAuthorsArgs {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  birthDate?: Date;
}
