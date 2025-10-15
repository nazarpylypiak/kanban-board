import { ITask } from '@kanban-board/shared';
import { createPortal } from 'react-dom';

interface Props {
  task: ITask;
  container: HTMLElement;
}

export default function DragPreview({ task, container }: Props) {
  return createPortal(
    <div className="w-64 max-w-xs p-3 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="font-semibold text-gray-800 truncate" title={task.title}>
        {task.title}
      </div>

      {task.description && (
        <div
          className="text-sm text-gray-500 mt-1 line-clamp-2"
          title={task.description}
        >
          {task.description}
        </div>
      )}

      {task.assignees?.length && (
        <div className="flex items-center mt-2 gap-1 flex-wrap">
          {task.assignees.map((a) => (
            <div
              key={a.id}
              className="w-6 h-6 rounded-full bg-gray-300 text-xs font-semibold text-gray-700 flex items-center justify-center"
              title={a.email}
            >
              {a?.email?.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {task.isDone && (
        <div className="mt-2 inline-block text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
          Completed
        </div>
      )}
    </div>,
    container
  );
}
