import { IColumn } from '@kanban-board/shared';
import { useRef, useState } from 'react';
import CreateTaskButton from './CreateTaskButton';
interface ColumnProps {
  col: IColumn;
}

export default function Column({ col }: ColumnProps) {
  const ref = useRef(null);
  const [state, setState] = useState<'validMove' | 'invalidMove' | 'idle'>(
    'idle'
  );

  // useEffect(() => {
  //   const el = ref.current;

  //   if (el) {
  //     return dropTargetForElements({
  //       element: el,
  //       getData: () => ({ col }),
  //       onDragEnter: ({ source }) => {
  //         if (!source.data.col || !col) return;

  //         if (source.data.col === col) {
  //           setState('idle');
  //         } else if (
  //           allowedTransitions[source.data.col as TaskStatus] === col
  //         ) {
  //           setState('validMove');
  //         } else {
  //           setState('invalidMove');
  //         }
  //       },
  //       onDragLeave: () => setState('idle'),
  //       onDrop: () => setState('idle')
  //     });
  //   }
  // }, []);
  // const title = col.at(0)?.toUpperCase() + col.slice(1);

  return (
    <div
      ref={ref}
      className={`${getColor(state)} w-64 bg-white rounded shadow p-4 `}
    >
      <h2>{col.name}</h2>

      <CreateTaskButton />

      <div className="flex flex-col gap-2 p-2 rounded transition-colors">
        {/* {tasks[col].map((task) => (
          <TaskComponent key={task.id} task={task} col={col} />
        ))} */}
      </div>
    </div>
  );
}

function getColor(state: 'validMove' | 'invalidMove' | 'idle'): string {
  if (state === 'validMove') {
    return 'bg-blue-100 border-2 border-blue-300';
  }
  return '';
}
