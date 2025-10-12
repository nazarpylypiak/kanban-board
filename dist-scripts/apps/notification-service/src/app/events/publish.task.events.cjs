"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const amqp = tslib_1.__importStar(require("amqplib"));
async function publish() {
    try {
        // Підключення до RabbitMQ
        const conn = await amqp.connect('amqp://guest:guest@localhost:5672');
        const channel = await conn.createChannel();
        // Створюємо exchange
        const exchange = 'kanban_exchange';
        await channel.assertExchange(exchange, 'topic', { durable: true });
        // Тестова подія
        const event = {
            type: 'task.created',
            payload: {
                task: {
                    id: '123',
                    title: 'Test Task',
                    description: 'This is a test task for E2E',
                    assigneeEmail: 'your_email@mailtrap.io'
                },
                users: [{ id: 'user-uuid', email: 'your_email@mailtrap.io' }]
            }
        };
        // Публікуємо у RabbitMQ
        channel.publish(exchange, 'task.created', Buffer.from(JSON.stringify(event)));
        console.log('📤 Event published: task.created');
        await channel.close();
        await conn.close();
    }
    catch (err) {
        console.error('❌ Failed to publish event:', err);
    }
}
publish();
//# sourceMappingURL=publish.task.events.js.map