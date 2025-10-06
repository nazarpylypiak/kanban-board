import { IBoard } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BoardsState {
  data: IBoard[];
  loading: boolean;
  error: string | null;
}

const initialState: BoardsState = {
  data: [],
  loading: false,
  error: null
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<IBoard[]>) => {
      state.data = action.payload;
    },
    addBoard: (state, action: PayloadAction<IBoard>) => {
      state.data.push(action.payload);
    },
    updateBoard: (state, action: PayloadAction<IBoard>) => {
      const index = state.data.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteBoard: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((b) => b.id !== action.payload);
    }
  }
});

export const { setBoards, updateBoard, addBoard, deleteBoard } =
  boardsSlice.actions;
export default boardsSlice.reducer;
