import { IUser } from '@kanban-board/shared';
import { useState } from 'react';
// import Select from 'react-select';
import { TCreateTask } from '../../../shared/types/task.type';
import AddTaskModal from '../modals/AddTaskModal';
interface Props {
  onCreateTask: (task: TCreateTask) => void;
  users: IUser[];
  currentUser: IUser | null;
}

export default function AddNewTask({
  onCreateTask,
  users,
  currentUser
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (task: TCreateTask | null) => {
    if (task) onCreateTask(task);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 bg-blue-600 text-white rounded-md w-full"
      >
        + New Task
      </button>

      <AddTaskModal
        open={open}
        onClose={(t) => handleSubmit(t)}
        users={users}
        boardOwner={currentUser}
      />
    </>
  );
}
