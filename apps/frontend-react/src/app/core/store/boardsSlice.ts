import { IBoard, IColumn } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BoardsState {
  data: IBoard[];
  loading: boolean;
  error: string | null;
}

interface AddColumnPayload {
  boardId: string;
  column: IColumn;
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
    },
    setColumns: (
      state,
      action: PayloadAction<{ boardId: string; columns: IColumn[] }>
    ) => {
      const board = state.data.find(({ id }) => id === action.payload.boardId);

      if (board) {
        if (!action.payload.columns.length) board.columns = [];
        board.columns = action.payload.columns;
      }
    },
    addColumnToBoard: (state, action: PayloadAction<AddColumnPayload>) => {
      const board = state.data.find(({ id }) => id === action.payload.boardId);

      if (board) {
        if (!board.columns) board.columns = [];
        board.columns.push(action.payload.column);
      }
    }
  }
});

export const {
  setBoards,
  updateBoard,
  addBoard,
  deleteBoard,
  setColumns,
  addColumnToBoard
} = boardsSlice.actions;
export default boardsSlice.reducer;
