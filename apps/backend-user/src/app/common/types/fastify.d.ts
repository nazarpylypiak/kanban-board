import { UserPayload } from './user-payload.interface';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserPayload;
  }
}
