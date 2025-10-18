import { inject, Injectable } from '@angular/core';
import {
  IBoardNotificationWrapper,
  IColumnNotificationWrapper,
  INotificationUser
} from '@kanban-board/shared';
import { Store } from '@ngrx/store';
import { filter, Observable, take } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { selectAccessToken } from '../../core/store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private store = inject(Store);
  accessToken$ = this.store.select(selectAccessToken);

  constructor() {
    this.accessToken$
      .pipe(
        filter((token): token is string => !!token),
        take(1)
      )
      .subscribe({
        next: (accessToken) => this.initSocket(accessToken)
      });
  }

  initSocket(token: string) {
    this.socket = io(environment.socketUrl, {
      auth: {
        token
      }
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
