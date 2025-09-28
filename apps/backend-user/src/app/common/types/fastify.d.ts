import { User } from '@kanban-board/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}
