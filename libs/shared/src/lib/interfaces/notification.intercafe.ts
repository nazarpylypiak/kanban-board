export interface IRabbitMessage {
  payload: Record<string, unknown>;
  createdBy: string;
  recipientIds?: string[];
  recepientEmails?: string[];
}

export interface IUserNotificationEvent<T = string> extends IRabbitMessage {
  timestamp?: string;
  eventType: T;
}
