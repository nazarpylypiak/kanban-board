import { Injectable, Scope } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';
import { ILogger, LoggerMeta } from './types';

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService implements ILogger {
  private readonly logger: PinoLogger;

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

  /** Format message and remove context from meta */
  private format(msg: string, meta?: LoggerMeta | string, context?: string) {
    let rest: Record<string, any> = {};

    if (typeof meta === 'string') {
      context = meta;
    } else if (meta) {
      rest = { ...meta };
      if ('context' in rest) delete rest['context'];
      if (!context && 'context' in meta) context = meta['context'];
    }

    const finalMsg = context ? `[${context}] ${msg}` : msg;
    return { finalMsg, rest };
  }

  log(msg: string, meta?: LoggerMeta | string) {
    const { finalMsg, rest } = this.format(msg, meta);
    this.logger.info(rest, finalMsg);
  }

  info(msg: string, meta?: LoggerMeta | string) {
    const { finalMsg, rest } = this.format(msg, meta);
    this.logger.info(rest, finalMsg);
  }

  warn(msg: string, meta?: LoggerMeta | string) {
    const { finalMsg, rest } = this.format(msg, meta);
    this.logger.warn(rest, finalMsg);
  }

  error(msg: string, meta?: LoggerMeta | string) {
    const { finalMsg, rest } = this.format(msg, meta);
    this.logger.error(rest, finalMsg);
  }

  debug(msg: string, meta?: LoggerMeta | string) {
    const { finalMsg, rest } = this.format(msg, meta);
    this.logger.debug(rest, finalMsg);
  }

  /** Create a child logger with inherited context */
  child(meta: LoggerMeta): ILogger {
    const parentContext = meta['context'];
    const { context, rest } = { context: parentContext, rest: { ...meta } };
    if ('context' in rest) delete rest['context'];

    const childLogger = this.logger.child(rest);
    return this.wrapPino(childLogger, context);
  }

  /** Wrap PinoLogger and propagate context */
  private wrapPino(loggerInstance: PinoLogger, context?: string): ILogger {
    return {
      log: (msg, meta?) => {
        const { finalMsg, rest } = this.format(msg, meta, context);
        loggerInstance.info(rest, finalMsg);
      },
      info: (msg, meta?) => {
        const { finalMsg, rest } = this.format(msg, meta, context);
        loggerInstance.info(rest, finalMsg);
      },
      warn: (msg, meta?) => {
        const { finalMsg, rest } = this.format(msg, meta, context);
        loggerInstance.warn(rest, finalMsg);
      },
      error: (msg, meta?) => {
        const { finalMsg, rest } = this.format(msg, meta, context);
        loggerInstance.error(rest, finalMsg);
      },
      debug: (msg, meta?) => {
        const { finalMsg, rest } = this.format(msg, meta, context);
        loggerInstance.debug(rest, finalMsg);
      },
      child: (childMeta) =>
        this.wrapPino(loggerInstance.child(childMeta), context)
    };
  }
}
