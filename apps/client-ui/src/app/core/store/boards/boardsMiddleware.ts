import { IUser } from '@kanban-board/shared';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { createApi } from '../../services/api';
import { setBoardUsers, updateBoard } from './boardsSlice';

export const listenerBoardsMiddleware = createListenerMiddleware();

listenerBoardsMiddleware.startListening({
  actionCreator: updateBoard,
  effect: async (action, listenerApi) => {
    try {
      const boardId = action.payload.id;
      const res = await createApi('/api/boards', listenerApi).get<IUser[]>(
        `${boardId}/users`
      );

      listenerApi.dispatch(setBoardUsers({ boardId, users: res.data }));
    } catch (e) {
      console.error('Failed to read board users', e);
    }
  }
});
