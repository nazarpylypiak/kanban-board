import { IUser, User } from '@kanban-board/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  user: IUser | null;
}

const initialState: AuthState = {
  accessToken: null,
  loading: true,
  isLoggedIn: false,
  user: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearAccessToken: (state) => {
      state.accessToken = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.isLoggedIn = false;
      state.user = null;
    }
  }
});

export const {
  setAccessToken,
  clearAccessToken,
  setLoading,
  setLoggedIn,
  setUser,
  clearAuth
} = authSlice.actions;
export default authSlice.reducer;
