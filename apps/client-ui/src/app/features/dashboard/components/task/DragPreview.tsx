import { ITask } from '@kanban-board/shared';
import { createPortal } from 'react-dom';

interface Props {
  task: ITask;
  container: HTMLElement;
}

export default function DragPreview({ task, container }: Props) {
  return createPortal(
    <div className="w-52 max-w-xs p-3 bg-white rounded shadow-md border border-gray-200">
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
    </div>,
    container
  );
}
