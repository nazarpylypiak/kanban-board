// authenticated-request.interface.ts
import { FastifyRequest } from 'fastify';
import { IUser } from './user.interface';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: IUser;
}
