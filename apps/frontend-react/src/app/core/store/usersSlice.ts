import { IUser } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UsersState {
  data: IUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  data: [],
  loading: false,
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<IUser[]>) => {
      state.data = action.payload;
    }
  }
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;
