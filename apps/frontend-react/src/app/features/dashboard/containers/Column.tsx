import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IColumn, ITask } from '@kanban-board/shared';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTasksByColumn } from '../../../core/store/selectors/taskSelectors';
import { addTask } from '../../../core/store/tasksSlice';
import { create } from '../../../shared/services/task.service';
import CreateTaskButton from '../components/CreateTaskButton';
import TaskComponent from './Task';

interface ColumnProps {
  col: IColumn;
}

export default function Column({ col }: ColumnProps) {
  const ref = useRef(null);
  const [state, setState] = useState<'validMove' | 'invalidMove' | 'idle'>(
    'idle'
  );
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasksByColumn(col.id));

  useEffect(() => {
    const el = ref.current;

    if (el) {
      return dropTargetForElements({
        element: el,
        getData: () => ({ col }),
        onDragEnter: ({ source }) => {
          if (!source.data.col || !col) return;

          if (source.data.col === col) {
            setState('idle');
          } else {
            setState('validMove');
          }
        },
        onDragLeave: () => setState('idle'),
        onDrop: () => setState('idle')
      });
    }
  }, []);

  const taskCreated = async (task: Omit<ITask, 'columnId'>) => {
    await create(col.id, task).then((res) => dispatch(addTask(res.data)));
  };

  return (
    <div
      ref={ref}
      className={`${getColor(state)} w-64 bg-white rounded shadow p-4 `}
    >
      <h2>{col.name}</h2>

      <CreateTaskButton onCreateTask={(task) => taskCreated(task)} />

      <div className="flex flex-col gap-2 p-2 rounded transition-colors">
        {tasks.map((task) => (
          <TaskComponent key={task.id} task={task} col={col} />
        ))}
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
