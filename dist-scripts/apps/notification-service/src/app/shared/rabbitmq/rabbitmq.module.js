"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RMQModule = void 0;
const tslib_1 = require("tslib");
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RMQModule = class RMQModule {
};
exports.RMQModule = RMQModule;
exports.RMQModule = RMQModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_rabbitmq_1.RabbitMQModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    exchanges: [
                        {
                            name: 'kanban_exchange',
                            type: 'topic'
                        }
                    ],
                    uri: configService.get('RABBITMQ_URL') || 'amqp://localhost:5672',
                    connectionInitOptions: { wait: true }
                }),
                inject: [config_1.ConfigService]
            })
        ],
        exports: [nestjs_rabbitmq_1.RabbitMQModule]
    })
], RMQModule);
//# sourceMappingURL=rabbitmq.module.js.map