import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IColumn, ITask } from '@kanban-board/shared';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTasksByColumn } from '../../../../core/store/selectors/taskSelectors';
import { addTask } from '../../../../core/store/tasksSlice';
import { create } from '../../../../shared/services/task.service';
import CreateTaskButton from '../../components/CreateTaskButton';
import TaskComponent from '../task/Task';
import { isTaskData, TaskData } from '../task/task-data';
import {
  getColumnData,
  isDraggingATask,
  isTaskDropTargetData
} from './column-data';

interface ColumnProps {
  col: IColumn;
}
const idle = { type: 'idle' } satisfies ColumnState;
type ColumnState =
  | { type: 'is-task-over'; isOverChildCard: boolean; dragging: DOMRect }
  | { type: 'idle' };

const stateStyles: { [Key in ColumnState['type']]: string } = {
  idle: 'cursor-grab',
  'is-task-over': 'bg-blue-100 border-2 border-blue-300'
};

export default function Column({ col }: ColumnProps) {
  const ref = useRef(null);
  const [state, setState] = useState<ColumnState>(idle);
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasksByColumn(col.id));
  function setIsTaskOver({
    data,
    location
  }: {
    data: TaskData;
    location: DragLocationHistory;
  }) {
    const innerMost = location.current.dropTargets[0];
    const isOverChildCard = Boolean(
      innerMost && isTaskDropTargetData(innerMost.data)
    );

    const proposed: ColumnState = {
      type: 'is-task-over',
      dragging: data.rect,
      isOverChildCard
    };

    setState((current) => {
      if (isShallowEqual(proposed, current)) {
        return current;
      }
      return proposed;
    });
  }
  const data = getColumnData({ column: col });

  useEffect(() => {
    const element = ref.current;

    if (element) {
      return dropTargetForElements({
        element,
        getData: () => data,
        canDrop({ source }) {
          return isDraggingATask({ source });
        },
        getIsSticky: () => true,
        onDragStart({ source, location }) {
          if (isTaskData(source.data)) {
            setIsTaskOver({ data: source.data, location });
          }
        },
        onDragEnter({ source, location }) {
          if (isTaskData(source.data)) {
            setIsTaskOver({ data: source.data, location });
          }
        },
        onDragLeave: () => setState(idle),
        onDrop: () => setState(idle)
      });
    }
  }, []);

  const taskCreated = async (task: Omit<ITask, 'columnId' | 'position'>) => {
    await create(col.id, task).then((res) => dispatch(addTask(res.data)));
  };

  return (
    <div
      ref={ref}
      className={`${stateStyles[state.type]} w-64 bg-white rounded shadow p-4 flex flex-col h-full`}
    >
      <h2 className="font-bold mb-2">{col.name}</h2>

      <div className="overflow-y-auto flex flex-col gap-2 p-2 rounded transition-colors">
        {tasks.map((task) => (
          <TaskComponent key={task.id} task={task} col={col} />
        ))}
      </div>

      <div className="mt-2">
        <CreateTaskButton onCreateTask={(task) => taskCreated(task)} />
      </div>
    </div>
  );
}

export function isShallowEqual(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }
  return keys1.every((key1) => Object.is(obj1[key1], obj2[key1]));
}
