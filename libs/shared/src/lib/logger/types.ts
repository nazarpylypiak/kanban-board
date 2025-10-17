export interface LoggerMeta {
  requestId?: string;
  userId?: string;
  boardId?: string;
  [key: string]: any;
}

export interface ILogger {
  log(message: string, meta?: LoggerMeta): void;
  info(message: string, meta?: LoggerMeta): void;
  warn(message: string, meta?: LoggerMeta): void;
  error(message: string, meta?: LoggerMeta): void;
  debug(message: string, meta?: LoggerMeta): void;
  child(meta: LoggerMeta): ILogger;
}
