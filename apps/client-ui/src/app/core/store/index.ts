import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice';
import { listenerBoardsMiddleware } from './boards/boardsMiddleware';
import { boardsReducer } from './boards/boardsSlice';
import { columnsReducer } from './columnsSlice';
import { tasksReducer } from './tasks';
import { usersReducer } from './usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    columns: columnsReducer,
    tasks: tasksReducer,
    users: usersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerBoardsMiddleware.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
