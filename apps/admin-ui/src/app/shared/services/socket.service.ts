import { Injectable } from '@angular/core';
import { IUserNotificationEvent } from '@kanban-board/shared';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  constructor() {
    this.socket = io('http://localhost:3005', {
      // auth: {
      //   token: localStorage.getItem('accessToken')
      // }
    });
  }

  onNotification(): Observable<IUserNotificationEvent> {
    return new Observable((subscriber) => {
      this.socket.on('notification', (data: IUserNotificationEvent) => {
        subscriber.next(data);
      });
    });
  }

  joinAdminRoom(adminId: string) {
    this.socket.emit('subscribeAdmin', { adminId });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
