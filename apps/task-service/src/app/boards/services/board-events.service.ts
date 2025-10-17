import {
  Board,
  IBoardNotificationPayload,
  IBoardNotificationWrapper,
  INotification,
  JWTUser,
  RabbitmqService
} from '@kanban-board/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardEventsService {
  constructor(private rmqService: RabbitmqService) {}

  private buildSharedMessage(
    board: Board,
    currentUser: JWTUser
  ): INotification<IBoardNotificationWrapper> {
    return {
      eventType: 'board.shared',
      type: 'BOARD_SHARED',
      payload: {
        board: {
          id: board.id,
          name: board.name,
          ownerId: board.ownerId,
          sharedUserIds: board.sharedUserIds
        }
      },
      createdBy: currentUser.sub,
      adminIds: [board.ownerId],
      recipientIds: board.sharedUserIds,
      timestamp: new Date().toISOString()
    };
  }

  publishShared(board: Board, currentUser: JWTUser) {
    const msg = this.buildSharedMessage(board, currentUser);
    this.rmqService.publish<INotification<IBoardNotificationWrapper>>(
      'kanban_exchange',
      'board.shared',
      msg
    );
  }

  private buildUnsharedMessage(
    boardId: string,
    removedUserIds: string[],
    currentUser: JWTUser,
    ownerId: string
  ): INotification<IBoardNotificationWrapper> {
    return {
      eventType: 'board.deleted',
      type: 'BOARD_DELETED',
      payload: { boardId } as IBoardNotificationPayload,
      createdBy: currentUser.sub,
      adminIds: [ownerId],
      recipientIds: removedUserIds,
      timestamp: new Date().toISOString()
    };
  }

  publishDeleted(
    boardId: string,
    removedUserIds: string[],
    currentUser: JWTUser,
    ownerId: string
  ) {
    const msg = this.buildUnsharedMessage(
      boardId,
      removedUserIds,
      currentUser,
      ownerId
    );
    this.rmqService.publish<INotification<IBoardNotificationWrapper>>(
      'kanban_exchange',
      'board.deleted',
      msg
    );
  }
}
