import { Injectable } from '@angular/core';
import { INotification, IRabbitMessage } from '@kanban-board/shared';
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

  onNotification(): Observable<INotification> {
    return new Observable((subscriber) => {
      this.socket.on('notification', (data: IRabbitMessage) => {
        console.log('admin received', data);
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
