import {
  IBoardNotificationWrapper,
  IColumnNotificationWrapper,
  INotification,
  ITaskNotificationWrapper,
  LoggerService,
  MailService
} from '@kanban-board/shared';
import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private logger = this.loggerService.child({
    context: NotificationService.name
  });
  constructor(
    private readonly gateway: NotificationGateway,
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService
  ) {}

  async handleEvent(
    event: INotification<
      | IBoardNotificationWrapper
      | IColumnNotificationWrapper
      | ITaskNotificationWrapper
    >
  ) {
    if (!event.payload) {
      this.logger.warn('Received event without payload', {
        eventType: event.eventType
      });
      return;
    }

    const {
      eventType,
      payload,
      createdBy,
      recipientIds = [],
      adminIds = [],
      type,
      message,
      timestamp
    } = event;

    const notification = {
      eventType,
      type,
      payload,
      createdBy,
      message,
      timestamp: timestamp || new Date().toISOString()
    };

    // Notify shared users (exclude creator)
    const userRecipients = recipientIds.filter((id) => id !== createdBy);

    if (userRecipients.length > 0) {
      await this.gateway.sendToUsers(userRecipients, notification);
      this.logger.log(
        `WebSocket notifications sent to ${userRecipients.length} users`,
        { eventType }
      );
    } else {
      this.logger.debug(`No shared users to notify`, { eventType });
    }

    // Notify admins
    if (adminIds && adminIds.length > 0) {
      await this.gateway.notifyAdmins(adminIds, notification);
      this.logger.log(
        `WebSocket notifications sent to ${adminIds.length} admins`,
        { eventType }
      );
    } else {
      this.logger.debug(`No admins to notify`, { eventType });
    }
  }

  async sendEmailNotification(
    event: INotification<
      IBoardNotificationWrapper | IColumnNotificationWrapper
    >,
    recipientEmails: string[] = []
  ) {
    if (!recipientEmails.length || !event.payload) return;

    const { eventType, message } = event;

    for (const email of recipientEmails) {
      const subject = `Board Notification: ${eventType}`;
      const text = `
        Hi,
        ${message || 'There is an update on your board.'}
      `;
      try {
        await this.mailService.sendMail(email, subject, text);
        this.logger.log(`Email notification sent to ${email}`, { eventType });
      } catch (err) {
        this.logger.error(`Failed to send email to ${email}`, {
          eventType,
          stack: err.stack
        });
      }
    }
  }
}
