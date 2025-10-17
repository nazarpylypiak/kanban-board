import { Task } from '@kanban-board/shared';

export const mapTaskToTto = (task: Task) => {
  const assignees =
    task.assignees?.map((u) => ({ id: u.id, email: u.email })) || [];
  const assigneeIds = task.assignees?.map(({ id }) => id);

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    columnId: task.column.id,
    position: task.position,
    isDone: task.isDone,
    completedAt: task.completedAt,
    assignees,
    assigneeIds,
    owner: {
      id: task.owner.id,
      email: task.owner.email
    }
  };
};
