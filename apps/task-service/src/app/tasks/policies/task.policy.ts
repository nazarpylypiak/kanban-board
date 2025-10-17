import { Board, JWTUser, Task } from '@kanban-board/shared';
import { ForbiddenException } from '@nestjs/common';

export class TaskPolicy {
  /**
   * Can the user create a task in the given board?
   */
  static assertCanCreate(board: Board, user: JWTUser) {
    if (this.canCreate(board, user)) return;
    throw new ForbiddenException('You do not have permission to create tasks');
  }

  static canCreate(board: Board, user: JWTUser): boolean {
    return (
      user.role === 'admin' ||
      board.ownerId === user.sub ||
      board.sharedUsers?.some((u) => u.id === user.sub)
    );
  }

  /**
   * Can the user update the given task?
   */
  static assertCanUpdate(task: Task, user: JWTUser) {
    if (this.canUpdate(task, user)) return;
    throw new ForbiddenException(
      'You do not have permission to update this task'
    );
  }

  static canUpdate(task: Task, user: JWTUser): boolean {
    return (
      user.role === 'admin' ||
      task.ownerId === user.sub ||
      task.assigneeIds?.includes(user.sub) ||
      task.board?.sharedUsers?.some((u) => u.id === user.sub)
    );
  }

  /**
   * Can the user delete the given task?
   */
  static assertCanDelete(task: Task, user: JWTUser) {
    if (this.canDelete(task, user)) return;
    throw new ForbiddenException(
      'You do not have permission to delete this task'
    );
  }

  static canDelete(task: Task, user: JWTUser): boolean {
    return user.role === 'admin' || task.ownerId === user.sub;
  }

  /**
   * Can the user move or reorder a task on this board?
   */
  static assertCanMove(task: Task, user: JWTUser) {
    if (this.canMove(task, user)) return;
    throw new ForbiddenException(
      'You do not have permission to move this task'
    );
  }

  static canMove(task: Task, user: JWTUser): boolean {
    return (
      user.role === 'admin' ||
      task.board?.sharedUsers?.some((u) => u.id === user.sub) ||
      task.board?.ownerId === user.sub
    );
  }
}
