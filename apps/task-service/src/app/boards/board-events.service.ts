import {
  Board,
  IRabbitMessage,
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
  ): IRabbitMessage {
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
    this.rmqService.publish('kanban_exchange', 'board.shared', msg);
  }

  private buildUnsharedMessage(
    boardId: string,
    removedUserIds: string[],
    currentUser: JWTUser,
    ownerId: string
  ): IRabbitMessage {
    return {
      eventType: 'board.deleted',
      type: 'BOARD_DELETED',
      payload: { boardId },
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
    this.rmqService.publish('kanban_exchange', 'board.deleted', msg);
  }
}
