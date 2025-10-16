import { IBoardNotification, MailService } from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly gateway: NotificationGateway,
    private readonly mailService: MailService
  ) {}

  /**
   * Handle generic board event and notify both shared users and admins
   */
  async handleEvent(event: IBoardNotification) {
    if (!event.payload) {
      this.logger.warn('Received event without payload');
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

    // 1️⃣ Notify shared users (exclude creator)
    const userRecipients = recipientIds.filter((id) => id !== createdBy);

    if (userRecipients.length > 0) {
      await this.gateway.sendToUsers(userRecipients, notification);
      this.logger.log(
        `WebSocket notifications sent to ${userRecipients.length} users`
      );
    } else {
      this.logger.debug(`No shared users to notify for event: ${eventType}`);
    }

    // 2️⃣ Notify admins
    if (adminIds && adminIds.length > 0) {
      await this.gateway.notifyAdmins(adminIds, notification);
      this.logger.log(
        `WebSocket notifications sent to ${adminIds.length} admins`
      );
    } else {
      this.logger.debug(`No admins to notify for event: ${eventType}`);
    }
  }

  async handleBoardEvent(event: IBoardNotification) {
    return this.handleEvent(event);
  }

  async sendEmailNotification(
    event: IBoardNotification,
    recipientEmails: string[] = []
  ) {
    if (!recipientEmails.length || !event.payload) return;

    const { eventType, payload, message } = event;

    for (const email of recipientEmails) {
      const subject = `Board Notification: ${eventType}`;
      const text = `
        Hi,
        ${message || 'There is an update on your board.'}
        Board: ${payload.board?.name || 'Unknown'}
      `;
      try {
        await this.mailService.sendMail(email, subject, text);
        this.logger.log(`Email notification sent to ${email}`);
      } catch (err) {
        this.logger.error(`Failed to send email to ${email}`, err.stack);
      }
    }
  }
}
