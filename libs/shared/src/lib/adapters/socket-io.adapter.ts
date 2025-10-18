import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';
import { LoggerService } from '../logger';

export class SocketIOAdapter extends IoAdapter {
  constructor(
    app: INestApplication,
    private origins: string[],
    private logger: LoggerService
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: this.origins, credentials: true }
    });

    const wsLogger = this.logger.child({ context: 'WebSocket' });

    server.on('connection', (socket: Socket) => {
      // wsLogger.info('🔌 Client connected', { socketId: socket.id });

      socket.onAny((event, ...args) => {
        wsLogger.debug('📨 Event received', {
          socketId: socket.id,
          event,
          args
        });
      });

      socket.on('disconnect', (reason) => {
        wsLogger.info('❌ Client disconnected', {
          socketId: socket.id,
          reason
        });
      });
    });

    return server;
  }
}
