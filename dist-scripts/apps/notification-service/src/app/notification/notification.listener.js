"use strict";
var NotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationListener = void 0;
const tslib_1 = require("tslib");
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let NotificationListener = NotificationListener_1 = class NotificationListener {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(NotificationListener_1.name);
    }
    async handleTaskEvent(event) {
        this.logger.log(`📬 Received event: ${event.type}`);
        await this.notificationService.handleEvent(event);
    }
};
exports.NotificationListener = NotificationListener;
tslib_1.__decorate([
    (0, nestjs_rabbitmq_1.RabbitSubscribe)({
        exchange: 'kanban_exchange',
        routingKey: 'task.*',
        queue: 'notification_queue'
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationListener.prototype, "handleTaskEvent", null);
exports.NotificationListener = NotificationListener = NotificationListener_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationListener);
//# sourceMappingURL=notification.listener.js.map