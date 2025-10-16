import {
  IColumn,
  IColumnNotificationWrapper,
  INotificationUser
} from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  addColumn,
  deleteColumn
} from '../../../../../core/store/columnsSlice';
import { socket } from '../../../../../socket';

export const useColumnNotifications = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleColumnNotification = (
      notification: INotificationUser<IColumnNotificationWrapper>
    ) => {
      const { type, payload } = notification;
      switch (type) {
        case 'COLUMN_ADDED':
          if (!payload?.column?.id) return;
          dispatch(addColumn(payload.column as IColumn));
          break;
        case 'COLUMN_DELETED':
          if (!payload?.columnId) return;
          dispatch(deleteColumn(payload.columnId));
          break;
        default:
      }
      console.log(notification);
    };

    socket.on('notification', handleColumnNotification);

    return () => {
      socket.off('notification', handleColumnNotification);
    };
  }, [dispatch]);
};
