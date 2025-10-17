import { Injectable, Scope } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';
import { ILogger, LoggerMeta } from './types';

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService implements ILogger {
  private logger: PinoLogger;

  constructor() {
    const env = process.env['NODE_ENV'];
    this.logger = pino({
      level: env === 'production' ? 'info' : 'debug',
      transport:
        env !== 'production'
          ? {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' }
            }
          : undefined
    });
  }

  log(message: string, meta?: LoggerMeta) {
    meta ? this.logger.info(meta, message) : this.logger.info(message);
  }

  info(message: string, meta?: LoggerMeta) {
    this.log(message, meta);
  }

  warn(message: string, meta?: LoggerMeta) {
    meta ? this.logger.warn(meta, message) : this.logger.warn(message);
  }

  error(message: string, meta?: LoggerMeta) {
    meta ? this.logger.error(meta, message) : this.logger.error(message);
  }

  debug(message: string, meta?: LoggerMeta) {
    meta ? this.logger.debug(meta, message) : this.logger.debug(message);
  }

  child(meta: LoggerMeta): ILogger {
    const childLogger = this.logger.child(meta);
    return {
      log: (msg, m) => (m ? childLogger.info(m, msg) : childLogger.info(msg)),
      info: (msg, m) => (m ? childLogger.info(m, msg) : childLogger.info(msg)),
      warn: (msg, m) => (m ? childLogger.warn(m, msg) : childLogger.warn(msg)),
      error: (msg, m) =>
        m ? childLogger.error(m, msg) : childLogger.error(msg),
      debug: (msg, m) =>
        m ? childLogger.debug(m, msg) : childLogger.debug(msg),
      child: (m) => this.child(m)
    };
  }
}
