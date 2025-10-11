import { IBoard } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BoardsState {
  data: IBoard[];
  loading: boolean;
  error: string | null;
  selectedBoard: IBoard | null;
}

const initialState: BoardsState = {
  data: [],
  loading: false,
  error: null,
  selectedBoard: null
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<IBoard[]>) => {
      state.data = action.payload;
      state.selectedBoard = state.data.length ? state.data[0] : null;
    },
    addBoard: (state, action: PayloadAction<IBoard>) => {
      const exists = state.data.some((b) => b.id === action.payload.id);
      if (!exists) {
        state.data.push(action.payload);
        if (!state.selectedBoard) state.selectedBoard = action.payload;
      }
    },
    updateBoard: (state, action: PayloadAction<IBoard>) => {
      const index = state.data.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteBoard: (state, action: PayloadAction<string>) => {
      const boardId = action.payload;
      console.log(boardId);
      state.data = state.data.filter((b) => b.id !== boardId);

      if (state.selectedBoard?.id === boardId) {
        state.selectedBoard = state.data.length ? state.data[0] : null;
      }
    },
    setSelectedBoard: (state, action: PayloadAction<IBoard | null>) => {
      state.selectedBoard = action.payload;
    }
  }
});

export const {
  setBoards,
  updateBoard,
  addBoard,
  deleteBoard,
  setSelectedBoard
} = boardsSlice.actions;

export default boardsSlice.reducer;
