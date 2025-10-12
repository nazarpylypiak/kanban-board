import { useState } from 'react';

interface Props {
  onBoardCreate: (boardName: string) => void;
}

export default function AddNewBoard({ onBoardCreate }: Props) {
  const [newBoardName, setNewBoardName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!newBoardName.trim()) {
      setError('Board name cannot be empty');
      return;
    }

    setError('');
    onBoardCreate(newBoardName.trim());
    setNewBoardName('');
  };

  return (
    <div className="flex flex-1 gap-2">
      <input
        value={newBoardName}
        onChange={(e) => {
          setNewBoardName(e.target.value);
          if (error) setError(''); // clear error while typing
        }}
        placeholder="New board name"
        className={`flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-400' : 'focus:ring-blue-400'
        }`}
      />

      {error && <span className="text-red-500 text-sm">{error}</span>}

      <button
        disabled={!newBoardName.trim()}
        onClick={handleCreate}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                   focus:outline-none focus:ring-2 focus:ring-blue-400
                   disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
      >
        Create
      </button>
    </div>
  );
}
