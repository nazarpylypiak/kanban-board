import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IColumn, IUser } from '@kanban-board/shared';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import { selectTasksByColumn } from '../../../../core/store/selectors/taskSelectors';
import { addTask } from '../../../../core/store/tasks/tasksSlice';
import { create } from '../../../../shared/services/task.service';
import { TCreateTask } from '../../../../shared/types/task.type';
import AddNewTask from '../../components/AddNewTask';
import TaskComponent from '../task/Task';
import { isTaskData, TaskData } from '../task/task-data';
import {
  getColumnData,
  isDraggingATask,
  isTaskDropTargetData
} from './column-data';

interface ColumnProps {
  col: IColumn;
  isOwner: boolean;
  user: IUser | null;
}
const idle = { type: 'idle' } satisfies ColumnState;
type ColumnState =
  | { type: 'is-task-over'; isOverChildCard: boolean; dragging: DOMRect }
  | { type: 'idle' };

const stateStyles: { [Key in ColumnState['type']]: string } = {
  idle: 'cursor-grab',
  'is-task-over': 'bg-blue-100 border-2 border-blue-300'
};

export default function Column({ col, isOwner, user }: ColumnProps) {
  const ref = useRef(null);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<ColumnState>(idle);
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasksByColumn(col.id));
  const users = useSelector((state: RootState) => state.users.data);

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
    const scrollable = scrollableRef.current;

    if (element && scrollable) {
      return combine(
        dropTargetForElements({
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
        }),
        autoScrollForElements({
          canScroll({ source }) {
            // if (!settings.isOverElementAutoScrollEnabled) {
            //   return false;
            // }

            return isDraggingATask({ source });
          },
          getConfiguration: () => ({
            maxScrollSpeed: 'standard'
          }),
          element: scrollable
        })
      );
    }
  }, []);

  const handleTaskCreate = async (task: TCreateTask) => {
    try {
      const res = await create(col.id, task);
      dispatch(addTask(res.data));
    } catch (e) {
      console.error('Failure to create task', e);
    }
  };

  return (
    <div
      ref={ref}
      className={`${stateStyles[state.type]} w-64 bg-white rounded shadow p-4 flex flex-col h-full`}
    >
      <h2 className="font-bold mb-2">{col.name}</h2>

      <div
        ref={scrollableRef}
        className="overflow-y-auto flex flex-col gap-2 p-2 rounded transition-colors"
      >
        {tasks.map((task, i) => (
          <TaskComponent index={i} key={task.id} task={task} col={col} />
        ))}
      </div>

      {isOwner && (
        <div className="mt-2">
          <AddNewTask
            onCreateTask={(task) => handleTaskCreate(task)}
            users={users}
            currentUser={user}
          />
        </div>
      )}
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
