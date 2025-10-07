import { IUser } from '@kanban-board/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user?: IUser;
  }
}
