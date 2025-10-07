import { useState } from 'react';

interface Props {
  onAddColumn: (name: string) => void;
}
export default function AddNewColumn({ onAddColumn }: Props) {
  const [newColumnName, setNewColumnName] = useState('');
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newColumnName) return;
    onAddColumn(newColumnName);
    setNewColumnName('');
  };

  return (
    <div className="flex-shrink-0 w-64 bg-gray-200 p-4 flex flex-col gap-2 rounded shadow">
      <input
        value={newColumnName}
        onChange={(e) => setNewColumnName(e.target.value)}
        type="text"
        placeholder="Enter column name..."
        className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        onClick={handleAddColumn}
        type="button"
        className="w-full p-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600 transition"
      >
        Add Column
      </button>
    </div>
  );
}
