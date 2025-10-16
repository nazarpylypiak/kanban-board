export interface INotificationWrapper {
  type: string;
  eventType: string;
  payload: unknown;
}

export interface INotification<T extends INotificationWrapper> {
  eventType: T['eventType'];
  type: T['type'];
  payload: T['payload'];
  createdBy: string;
  recipientIds: string[];
  adminIds: string[];
  timestamp: string;
  message?: string;
}

export type INotificationUser<T extends INotificationWrapper> = Omit<
  INotification<T>,
  'recipientIds' | 'adminIds'
>;
