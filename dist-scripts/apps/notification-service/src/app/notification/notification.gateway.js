"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let NotificationGateway = class NotificationGateway {
    sendToUser(userId, payload) {
        this.server.to(userId).emit('notification', payload);
    }
    handleSubscribe(data) {
        const socket = this.server.sockets.sockets.get(data.userId);
        socket?.join(data.userId);
    }
};
exports.NotificationGateway = NotificationGateway;
tslib_1.__decorate([
    (0, websockets_1.WebSocketServer)(),
    tslib_1.__metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
tslib_1.__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    tslib_1.__param(0, (0, websockets_1.MessageBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleSubscribe", null);
exports.NotificationGateway = NotificationGateway = tslib_1.__decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: 'notifications' }),
    (0, common_1.Injectable)()
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map