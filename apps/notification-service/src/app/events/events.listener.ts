import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class EventsListener implements OnModuleInit {
  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    const conn = await amqp.connect('amqp://localhost');
    const channel = await conn.createChannel();
    await channel.assertQueue('board_events');

    channel.consume('board_events', async (msg) => {
      if (!msg) return;
      const event = JSON.parse(msg.content.toString());
      await this.notificationService.handleEvent(event);
      channel.ack(msg);
    });
  }
}
