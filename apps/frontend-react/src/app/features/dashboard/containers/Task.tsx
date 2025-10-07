import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IColumn, ITask } from '@kanban-board/shared';
import { useEffect, useRef, useState } from 'react';

interface TaskProps {
  task: ITask;
  col: IColumn;
}

export default function Task({ task, col }: TaskProps) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (el) {
      return draggable({
        element: el,
        getInitialData: () => ({ task, col }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false)
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`${
        dragging ? 'opacity-50 pointer-events-none' : 'opacity-100'
      } p-3 bg-gray-50 rounded shadow-sm hover:bg-gray-100 cursor-pointer`}
    >
      <div className="font-semibold">{task.title}</div>
      {task.description && (
        <div className="text-sm text-gray-500">{task.description}</div>
      )}
    </div>
  );
}
