import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import boardsReducer from './boardsSlice';
import columnsReducer from './columnsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    columns: columnsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
