import { IBoard, IUser } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BoardsState {
  data: IBoard[];
  loading: boolean;
  error: string | null;
  selectedBoard: IBoard | null;
  boardUsers: {
    [boardId: string]: IUser[];
  };
}

const initialState: BoardsState = {
  data: [],
  loading: false,
  error: null,
  selectedBoard: null,
  boardUsers: {}
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (
      state,
      action: PayloadAction<{
        boards: IBoard[];
        selectedBoardId?: string | null;
      }>
    ) => {
      state.data = action.payload.boards;
      if (action.payload.selectedBoardId) {
        const saved = state.data.find(
          (b) => b.id === action.payload.selectedBoardId
        );
        if (saved) {
          state.selectedBoard = saved;
        } else {
          state.selectedBoard = state.data.length ? state.data[0] : null;
        }
      } else {
        state.selectedBoard = state.data.length ? state.data[0] : null;
      }
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
    },
    setBoardUsers: (
      state,
      action: PayloadAction<{ boardId: string; users: IUser[] }>
    ) => {
      state.boardUsers[action.payload.boardId] = action.payload.users;
    }
  }
});

export const {
  setBoards,
  updateBoard,
  addBoard,
  deleteBoard,
  setSelectedBoard,
  setBoardUsers
} = boardsSlice.actions;

export const boardsReducer = boardsSlice.reducer;
