import { Injectable } from '@angular/core';
import {
  IBoardNotificationWrapper,
  IColumnNotificationWrapper,
  INotificationUser
} from '@kanban-board/shared';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  constructor() {
    this.socket = io(environment.socketUrl, {
      // auth: {
      //   token: localStorage.getItem('accessToken')
      // }
    });
  }

  onNotification(): Observable<
    INotificationUser<IBoardNotificationWrapper | IColumnNotificationWrapper>
  > {
    return new Observable((subscriber) => {
      this.socket.on(
        'notification',
        (
          data: INotificationUser<
            IBoardNotificationWrapper | IColumnNotificationWrapper
          >
        ) => {
          subscriber.next(data);
        }
      );
    });
  }

  joinAdminRoom(adminId: string) {
    this.socket.emit('subscribeAdmin', { adminId });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
