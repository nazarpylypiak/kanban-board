import { Board, Column, JWTUser } from '@kanban-board/shared';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class ColumnPolicy {
  assertCanCreate(board: Board, user: JWTUser) {
    const isAdmin = user.role === 'admin';
    const isOwner = board.ownerId === user.sub;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to create columns'
      );
    }
  }

  assertCanUpdate(column: Column, user: JWTUser) {
    const isAdmin = user.role === 'admin';
    const isOwner = column.board.ownerId === user.sub;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to update this column'
      );
    }
  }

  assertCanDelete(column: Column, user: JWTUser) {
    const isAdmin = user.role === 'admin';
    const isOwner = column.board.ownerId === user.sub;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to delete this column'
      );
    }
  }
}
