import { IUser } from '@kanban-board/shared';

export interface AuthState {
  accessToken: string | null;
  isLoggedIn: boolean;
  currentUser: IUser | null;
}

export const initialState: AuthState = {
  accessToken: null,
  isLoggedIn: false,
  currentUser: null
};
