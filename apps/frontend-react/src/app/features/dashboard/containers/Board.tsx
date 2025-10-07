import { IBoard, IColumn, ITask, TaskStatus } from '@kanban-board/shared';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { addColumnToBoard, setColumns } from '../../../core/store/boardsSlice';
import { create, getAll } from '../../../shared/services/columns.service';
import Column from './Column';

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

interface BoardProps {
  board: IBoard;
}

export default function Board({ board }: BoardProps) {
  const [newColumnName, setNewColumnName] = useState('');
  const columns = useSelector(
    (state: RootState) =>
      state.boards.data.find(({ id }) => id === board.id)?.columns || []
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if (!board.id) return;
    getAll(board.id).then((res) =>
      dispatch(setColumns({ boardId: board.id, columns: res.data }))
    );
  }, [board.id, dispatch]);

  const onAddColumn = async () => {
    if (!newColumnName) return;
    create(board.id, newColumnName).then((res) => {
      addColumnToBoard({ boardId: board.id, column: res.data });
      setNewColumnName('');
    });
  };
  // const [tasks, setTasks] = useState<Record<TaskStatus, ITask[]>>(tasksList);
  // useEffect(() => {
  //   return monitorForElements({
  //     onDrop({ source, location }) {
  //       const destination = location.current.dropTargets[0];

  //       if (!destination) return;
  //       const destinationLocation = destination.data.col as TaskStatus;
  //       const sourceLocation = source.data.col as TaskStatus;
  //       if (destinationLocation === sourceLocation) return;
  //       const task = source.data.task as ITask;

  //       setTasks((val) => {
  //         return {
  //           ...val,
  //           [sourceLocation]: val[sourceLocation].filter(
  //             ({ id }) => id !== task.id
  //           ),
  //           [destinationLocation]: [...val[destinationLocation], task]
  //         };
  //       });
  //     }
  //   });
  // }, [tasks]);
  return (
    <main className="flex gap-4 mt-4 h-screen bg-gray-100 p-4 overflow-x-auto">
      {columns.length > 0 &&
        columns.map((col: IColumn) => <Column key={col.id} col={col} />)}

      <div className="flex-shrink-0 w-64 h-full bg-gray-200 p-4 flex flex-col gap-2 rounded shadow">
        <input
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          type="text"
          placeholder="Enter column name..."
          className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={onAddColumn}
          type="button"
          className="w-full p-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600 transition"
        >
          Add Column
        </button>
      </div>
    </main>
  );
}
