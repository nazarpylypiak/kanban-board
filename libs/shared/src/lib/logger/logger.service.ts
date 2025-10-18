import { Injectable, Scope } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';
import { ILogger, LoggerMeta } from './types';

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService implements ILogger {
  private logger: PinoLogger;
  private context?: string;

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

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(message: string) {
    return this.context ? `[${this.context}] ${message}` : message;
  }

  log(message: string, meta?: LoggerMeta) {
    meta
      ? this.logger.info(meta, this.formatMessage(message))
      : this.logger.info(this.formatMessage(message));
  }

  info(message: string, meta?: LoggerMeta) {
    this.log(message, meta);
  }

  warn(message: string, meta?: LoggerMeta) {
    meta
      ? this.logger.warn(meta, this.formatMessage(message))
      : this.logger.warn(this.formatMessage(message));
  }

  error(message: string, meta?: LoggerMeta) {
    meta
      ? this.logger.error(meta, this.formatMessage(message))
      : this.logger.error(this.formatMessage(message));
  }

  debug(message: string, meta?: LoggerMeta) {
    meta
      ? this.logger.debug(meta, this.formatMessage(message))
      : this.logger.debug(this.formatMessage(message));
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
