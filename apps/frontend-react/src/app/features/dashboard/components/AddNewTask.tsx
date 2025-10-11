import { IUser } from '@kanban-board/shared';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { TCreateTask } from '../../../shared/types/task.type';
interface Props {
  onCreateTask: (task: TCreateTask) => void;
  users: IUser[];
  currentUser: IUser;
}

export default function AddNewTask({
  onCreateTask,
  users,
  currentUser
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask({ title, description, assigneeIds });
    setTitle('');
    setDescription('');
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

      {open &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-md w-96">
              <h2 className="text-lg font-semibold mb-3">Create Task</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="border p-2 rounded"
                  required
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="border p-2 rounded"
                />
                <Select
                  isMulti
                  options={users.map((u) => ({
                    value: u.id,
                    label: currentUser.id === u.id ? 'me' : u.email
                  }))}
                  value={users
                    .filter((u) => assigneeIds.includes(u.id))
                    .map((u) => ({
                      value: u.id,
                      label: u.email
                    }))}
                  onChange={(selectedOptions) => {
                    setAssigneeIds(selectedOptions.map((o) => o.value));
                  }}
                />

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-3 py-1 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
