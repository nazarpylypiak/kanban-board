import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { ITask, TaskStatus } from '@kanban-board/shared';
import { useEffect, useState } from 'react';
import BoardSelector from '../components/BoardSelector';
import Column from '../components/column';

const statuses = Object.values(TaskStatus);
const tasksList: Record<string, ITask[]> = {
  [TaskStatus.TODO]: [
    { id: '1', title: 'Design login page', assignedTo: 'Alice' },
    { id: '2', title: 'Set up database', assignedTo: 'Bob' }
  ],
  [TaskStatus.IN_PROGRESS]: [
    { id: '3', title: 'Create API endpoints', assignedTo: 'Charlie' }
  ],
  [TaskStatus.DONE]: [{ id: '4', title: 'Project setup', assignedTo: 'Alice' }]
};
export default function DashboardPage() {
  const [tasks, setTasks] = useState<Record<TaskStatus, ITask[]>>(tasksList);
  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];

        if (!destination) return;
        const destinationLocation = destination.data.col as TaskStatus;
        const sourceLocation = source.data.col as TaskStatus;
        if (destinationLocation === sourceLocation) return;
        const task = source.data.task as ITask;

        setTasks((val) => {
          return {
            ...val,
            [sourceLocation]: val[sourceLocation].filter(
              ({ id }) => id !== task.id
            ),
            [destinationLocation]: [...val[destinationLocation], task]
          };
        });
      }
    });
  }, [tasks]);
  const boardSelected = () => {};
  return (
    <>
      <BoardSelector onSelectBoard={boardSelected} />
      <main className="flex gap-4 mt-4 h-screen bg-gray-100">
        {statuses.map((col: TaskStatus) => (
          <Column key={col} tasks={tasks} col={col} />
        ))}
      </main>
    </>
  );
}
