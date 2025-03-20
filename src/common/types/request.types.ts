import { FastifyRequest, FastifyReply } from 'fastify';

import { UserEntity } from '../../users/entities/user.entity';

/** User entity without password field */
export type TLocalAuthUser = Omit<UserEntity, 'password'>;

/** JWT authenticated user payload */
export interface IJwtAuthUser {
  id: string;
}

/** FastifyRequest with user from JWT authentication */
export interface IJwtAuthUserRequest extends FastifyRequest {
  user: IJwtAuthUser;
}

/** FastifyRequest with user from LocalStrategy authentication */
export interface ILocalAuthUserRequest extends FastifyRequest {
  user: TLocalAuthUser;
}

/** Context type for request
 *  req and res properties are passed in GraphQL context by AppGraphQL module
 */
export interface IRequestContext {
  req: IJwtAuthUserRequest;
  res: FastifyReply;
}
