"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const notification_gateway_1 = require("../notification/notification.gateway");
const notification_listener_1 = require("../notification/notification.listener");
const notification_service_1 = require("../notification/notification.service");
const mail_module_1 = require("../shared/mail/mail.module");
const rabbitmq_module_1 = require("../shared/rabbitmq/rabbitmq.module");
let EventsModule = class EventsModule {
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [rabbitmq_module_1.RMQModule, mail_module_1.MailModule],
        providers: [notification_service_1.NotificationService, notification_listener_1.NotificationListener, notification_gateway_1.NotificationGateway]
    })
], EventsModule);
//# sourceMappingURL=events.module.js.map