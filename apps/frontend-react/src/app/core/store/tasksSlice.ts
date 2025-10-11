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
    updateTasksInColumn: (state, action: PayloadAction<ITask[]>) => {
      const updatedMap = new Map(action.payload.map((t) => [t.id, t]));
      state.data = state.data.map((task) => updatedMap.get(task.id) ?? task);
    }
  }
});

export const {
  setTasks,
  addTask,
  udpateTask,
  deleteTask,
  updateTasksInColumn
} = tasksSlice.actions;
export default tasksSlice.reducer;
