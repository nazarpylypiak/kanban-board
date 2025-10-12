"use strict";
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../shared/mail/mail.service");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(gateway, mailService) {
        this.gateway = gateway;
        this.mailService = mailService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async handleEvent(event) {
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
    async notifyUsers(payload, subject) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [notification_gateway_1.NotificationGateway,
        mail_service_1.MailService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map