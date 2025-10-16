import { Column } from '@kanban-board/shared';

export const mapColumnToDto = (column: Column) => {
  return {
    id: column.id,
    name: column.name,
    boardId: column.boardId,
    isDone: column.isDone,
    createdAt: column.createdAt.toISOString(),
    updatedAt: column.updatedAt.toISOString()
  };
};
