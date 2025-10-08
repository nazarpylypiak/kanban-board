import { ITask } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TasksState {
  data: ITask[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  data: [],
  loading: false,
  error: null
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ITask[]>) => {
      state.data = action.payload;
    },
    addTask: (state, action: PayloadAction<ITask>) => {
      state.data.push(action.payload);
    },
    udpateTask: (state, action: PayloadAction<ITask>) => {
      const taskIndex = state.data.findIndex(
        ({ id }) => id === action.payload.id
      );

      if (taskIndex !== -1) {
        state.data[taskIndex] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(({ id }) => id !== action.payload);
    },
    reorderTaskInColumn(
      state,
      action: PayloadAction<{
        taskId: string;
        columnId: string;
        newIndex: number;
      }>
    ) {
      const { taskId, columnId, newIndex } = action.payload;

      const tasksInColumn = state.data.filter((t) => t.columnId === columnId);
      const task = tasksInColumn.find((t) => t.id === taskId);
      if (!task) return;

      const otherTasks = tasksInColumn.filter((t) => t.id !== taskId);

      otherTasks.splice(newIndex, 0, task);

      otherTasks.forEach((t, i) => (t.position = i));

      state.data = [
        ...state.data.filter((t) => t.columnId !== columnId),
        ...otherTasks
      ];
    },
    moveTaskToColumn(
      state,
      action: PayloadAction<{
        taskId: string;
        sourceColumnId: string;
        destinationColumnId: string;
        newIndex: number;
      }>
    ) {
      const { taskId, sourceColumnId, destinationColumnId, newIndex } =
        action.payload;

      const task = state.data.find((t) => t.id === taskId);
      if (!task) return;

      const sourceTasks = state.data
        .filter((t) => t.columnId === sourceColumnId && t.id !== taskId)
        .sort((a, b) => a.position - b.position);
      sourceTasks.forEach((t, i) => (t.position = i));

      const destinationTasks = state.data
        .filter((t) => t.columnId === destinationColumnId)
        .sort((a, b) => a.position - b.position);

      task.columnId = destinationColumnId;
      destinationTasks.splice(newIndex, 0, task);

      destinationTasks.forEach((t, i) => (t.position = i));

      state.data = [
        ...state.data.filter(
          (t) =>
            t.columnId !== sourceColumnId && t.columnId !== destinationColumnId
        ),
        ...sourceTasks,
        ...destinationTasks
      ];
    }
  }
});

export const {
  setTasks,
  addTask,
  udpateTask,
  deleteTask,
  reorderTaskInColumn,
  moveTaskToColumn
} = tasksSlice.actions;
export default tasksSlice.reducer;
