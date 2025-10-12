import { MailService } from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly gateway: NotificationGateway,
    private readonly mailService: MailService
  ) {}

  async handleEvent(event: any) {
    const {
      type,
      task,
      assignedTo = [],
      title = task?.title,
      createdBy,
      description = task?.description,
      ...restEvent
    } = event;

    if (!task) {
      this.logger.warn('Received event without task payload');
      return;
    }

    // Ensure assignedTo is always an array
    const recipients = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    const recipientsToNotify = recipients.filter(
      (userId) => userId !== createdBy
    );

    for (const userId of recipientsToNotify) {
      // Send WebSocket notification
      this.gateway.sendToUser(userId, {
        type,
        task,
        title,
        description,
        timestamp: new Date().toISOString(),
        ...restEvent
      });
      this.logger.log(`WebSocket notification sent to user ${userId}`);

      // Send email if assignee email exists
      const assigneeEmail = task?.assigneeEmail;
      if (assigneeEmail) {
        const subject = `Task ${type}: ${task.title}`;
        const text = `
          Hi,
          Task "${task.title}" has been ${type}.
          Description: ${description || 'No description'}
          Check your Kanban board for details.
        `;
        await this.mailService.sendMail(assigneeEmail, subject, text);
        this.logger.log(`Email notification sent to ${assigneeEmail}`);
      }
    }
  }

  // Optional helper for more generic user notifications
  private async notifyUsers(payload: any, subject: string) {
    const recipients = payload.users || [];
    const text = JSON.stringify(payload, null, 2);

    for (const user of recipients) {
      if (user.email) {
        await this.mailService.sendMail(user.email, subject, text);
      }
      if (user.id) {
        await this.gateway.sendToUser(user.id, { subject, payload });
      }
    }
  }
}
