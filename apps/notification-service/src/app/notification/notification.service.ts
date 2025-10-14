import {
  ITask,
  IUserNotificationEvent,
  MailService
} from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly gateway: NotificationGateway,
    private readonly mailService: MailService
  ) {}

  async handleEvent(event: IUserNotificationEvent) {
    const { payload, eventType, createdBy, recipientIds, recepientEmails } =
      event;

    if (!payload) {
      this.logger.warn('Received event without payload');
      return;
    }
    // Ensure assignedTo is always an array
    const recipientIdsArr = Array.isArray(recipientIds)
      ? recipientIds
      : [recipientIds];
    const recipientsToNotify = recipientIdsArr.filter(
      (userId) => userId !== createdBy
    );

    for (const userId of recipientsToNotify) {
      // Send WebSocket notification

      this.gateway.sendToUser(userId, {
        ...event,
        timestamp: new Date().toISOString()
      });
      this.logger.log(`WebSocket notification sent to user ${userId}`);
    }
    // Send email if assignee email exists
    if (payload.task) {
      for (const email of recepientEmails || []) {
        const { title, description } = payload.task as ITask;
        const subject = `Task ${eventType}: ${title}`;
        const text = `
          Hi,
          Task "${title}" has been ${eventType}.
          Description: ${description || 'No description'}
          Check your Kanban board for details.
        `;
        await this.mailService.sendMail(email, subject, text);
        this.logger.log(`Email notification sent to ${email}`);
      }
    }
  }

  // Optional helper for more generic user notifications
  // private async notifyUsers(payload: any, subject: string) {
  //   const recipients = payload.users || [];
  //   const text = JSON.stringify(payload, null, 2);

  //   for (const user of recipients) {
  //     if (user.email) {
  //       await this.mailService.sendMail(user.email, subject, text);
  //     }
  //     if (user.id) {
  //       await this.gateway.sendToUser(user.id, { subject, payload });
  //     }
  //   }
  // }
}
