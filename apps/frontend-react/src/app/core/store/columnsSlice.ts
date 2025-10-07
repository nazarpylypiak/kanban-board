import { IColumn } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface ColumnsState {
  data: IColumn[];
  loading: boolean;
  error: string | null;
}

const initialState: ColumnsState = {
  data: [],
  loading: false,
  error: null
};

const columnSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    setColumns: (state, action: PayloadAction<IColumn[]>) => {
      state.data = action.payload;
    },
    addColumn: (state, action: PayloadAction<IColumn>) => {
      state.data.push(action.payload);
    },
    updateColumn: (state, action: PayloadAction<IColumn>) => {
      const index = state.data.findIndex(({ id }) => id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteColumn: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(({ id }) => id !== action.payload);
    }
  }
});

export const { setColumns, addColumn, updateColumn, deleteColumn } =
  columnSlice.actions;

export default columnSlice.reducer;
