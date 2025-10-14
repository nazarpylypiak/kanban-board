import { ITask } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TasksState {
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
    updateTask: (state, action: PayloadAction<ITask>) => {
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
    },
    moveTaskToOtherColumn(
      state,
      action: PayloadAction<{
        task: ITask;
        homeColumnId: string;
        destinationColumnId: string;
        position: number;
      }>
    ) {
      const { task, homeColumnId, destinationColumnId, position } =
        action.payload;
      // const storedTask = state.data.find((t) => t.id === task.id);
      if (!task) return;

      const homeTasks = state.data
        .filter(({ columnId }) => columnId === homeColumnId)
        .sort((a, b) => a.position - b.position);
      const homeIndex = homeTasks.findIndex(({ id }) => id === task.id);

      if (homeIndex === -1) return;
      // remove task from home column
      homeTasks.splice(homeIndex, 1);

      const destTasks = state.data
        .filter(({ columnId }) => columnId === destinationColumnId)
        .sort((a, b) => a.position - b.position);

      const movedTask = { ...task, columnId: destinationColumnId };
      destTasks.splice(position, 0, movedTask);

      homeTasks.forEach((t, i) => (t.position = i));
      destTasks.forEach((t, i) => (t.position = i));

      const tasksMap = new Map(
        [...homeTasks, ...destTasks].map((t) => [t.id, t])
      );
      state.data = state.data.map((t) =>
        t.columnId === homeColumnId || t.columnId === destinationColumnId
          ? (tasksMap.get(t.id) ?? t)
          : t
      );
    },
    reorderTaskInSameColumn: (
      state,
      action: PayloadAction<{
        taskId: string;
        newPosition: number;
        destinationColumnId: string;
      }>
    ) => {
      const { taskId, destinationColumnId, newPosition } = action.payload;
      const tasks = state.data
        .filter(({ columnId }) => columnId === destinationColumnId)
        .sort((a, b) => a.position - b.position);
      const oldIndex = tasks.findIndex((t) => t.id === taskId);
      if (oldIndex === -1) return;

      // Remove and re-insert task
      const [movedTask] = tasks.splice(oldIndex, 1);
      tasks.splice(newPosition, 0, movedTask);

      // Normalize positions
      tasks.forEach((t, i) => (t.position = i));

      const tasksMap = new Map(tasks.map((t) => [t.id, t]));
      state.data = state.data.map((t) =>
        t.columnId === destinationColumnId ? (tasksMap.get(t.id) ?? t) : t
      );
    }
  }
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  updateTasksInColumn,
  moveTaskToOtherColumn,
  reorderTaskInSameColumn
} = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
