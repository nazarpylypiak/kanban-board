// authenticated-request.interface.ts
import { FastifyRequest } from 'fastify';
import { JWTUser } from './user.interface';

export interface AuthenticatedRequest extends FastifyRequest {
  jwtUser?: JWTUser;
}
