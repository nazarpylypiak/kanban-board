import { IBoard, IUser } from '@kanban-board/shared';
import { useState } from 'react';

interface ShareBoardModalProps {
  board: IBoard;
  users: IUser[]; // всі користувачі, з ким можна ділитися
  onClose: () => void;
  onShare: (boardId: string, userIds: string[]) => void;
}

export default function ShareBoardModal({
  board,
  users,
  onClose,
  onShare
}: ShareBoardModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    board.sharedUserIds || []
  );

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSave = () => {
    onShare(board.id, selectedUserIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Share "{board.name}"</h2>

        <div className="flex flex-col gap-2 mb-4">
          {users.map((user) => (
            <label key={user.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => toggleUser(user.id)}
              />
              <span>{user.email}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
