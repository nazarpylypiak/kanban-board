"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsListener = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const amqp = tslib_1.__importStar(require("amqplib"));
const notification_service_1 = require("../notification/notification.service");
let EventsListener = class EventsListener {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async onModuleInit() {
        const conn = await amqp.connect('amqp://localhost');
        const channel = await conn.createChannel();
        await channel.assertQueue('task_events');
        channel.consume('task_events', async (msg) => {
            if (!msg)
                return;
            const event = JSON.parse(msg.content.toString());
            await this.notificationService.handleEvent(event);
            channel.ack(msg);
        });
    }
};
exports.EventsListener = EventsListener;
exports.EventsListener = EventsListener = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [notification_service_1.NotificationService])
], EventsListener);
//# sourceMappingURL=events.listener.js.map