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
    const { type, task, assignedTo, title, description } = event;

    if (assignedTo) {
      this.gateway.sendToUser(assignedTo, {
        type,
        task,
        title,
        description,
        timestamp: new Date().toISOString()
      });
      this.logger.log(`WebSocket notification sent to user ${assignedTo}`);
    }

    if (assignedTo && task?.assigneeEmail) {
      const subject = `Task ${type}: ${task.title}`;
      const text = `
        Hi,
        Task "${task.title}" has been ${type}.
        Description: ${task.description || 'No description'}
        Check your Kanban board for details.
      `;
      await this.mailService.sendMail(task.assigneeEmail, subject, text);
      this.logger.log(`Email notification sent to ${task.assigneeEmail}`);
    }
  }

  private async notifyUsers(payload: any, subject: string) {
    const recipients = payload.users || []; // depends on your event schema
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
