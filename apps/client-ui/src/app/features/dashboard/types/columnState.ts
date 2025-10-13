export type ColumnState =
  | { type: 'is-task-over'; isOverChildCard: boolean; dragging: DOMRect }
  | { type: 'idle' };

export const getColumnStateStyles = (type: ColumnState['type']): string => {
  const stateStyles: Record<ColumnState['type'], string> = {
    idle: 'cursor-grab',
    'is-task-over': 'bg-blue-100 border-2 border-blue-300'
  };
  return stateStyles[type];
};
