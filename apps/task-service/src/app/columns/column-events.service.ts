import {
  Column,
  IColumnNotificationWrapper,
  INotification,
  JWTUser,
  RabbitmqService
} from '@kanban-board/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ColumnEventsService {
  constructor(private rmqService: RabbitmqService) {}

  private buildingMessage(
    column: Column,
    currentUser: JWTUser
  ): INotification<IColumnNotificationWrapper> {
    return {
      eventType: 'column.added',
      type: 'COLUMN_ADDED',
      payload: {
        column: {
          id: column.id,
          name: column.name,
          boardId: column.boardId,
          isDone: column.isDone,

          createdAt: column.createdAt.toISOString(),
          updatedAt: column.updatedAt.toISOString()
        }
      },
      adminIds: [column.board.ownerId],
      createdBy: currentUser.sub,
      recipientIds: column.board.sharedUserIds,
      timestamp: new Date().toISOString()
    };
  }

  publishCreated(column: Column, currentUser: JWTUser) {
    const msg = this.buildingMessage(column, currentUser);

    return this.rmqService.publish<INotification<IColumnNotificationWrapper>>(
      'kanban_exchange',
      'column.added',
      msg
    );
  }

  private buildingDeleteMessage(
    columnId: string,
    removedUserIds: string[],
    currentUser: JWTUser,
    ownerId: string
  ): INotification<IColumnNotificationWrapper> {
    return {
      eventType: 'column.deleted',
      type: 'COLUMN_DELETED',
      payload: {
        columnId
      },
      adminIds: [ownerId],
      createdBy: currentUser.sub,
      recipientIds: removedUserIds,
      timestamp: new Date().toISOString()
    };
  }

  publishDelete(
    columnId: string,
    removedUserIds: string[],
    currentUser: JWTUser,
    ownerId: string
  ) {
    const msg = this.buildingDeleteMessage(
      columnId,
      removedUserIds,
      currentUser,
      ownerId
    );

    this.rmqService.publish<INotification<IColumnNotificationWrapper>>(
      'kanban_exchange',
      'column.deleted',
      msg
    );
  }
}
