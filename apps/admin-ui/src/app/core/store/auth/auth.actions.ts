import { IUser } from '@kanban-board/shared';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export default createActionGroup({
  source: '[Auth]',
  events: {
    'Set Access Token': props<{ token: string }>(),
    'Clear Tokens': emptyProps(),
    'Fetch Current User': emptyProps(),
    'Fetch Current User Successfully': props<{ currentUser: IUser | null }>(),
    'Fetch Current User Failure': props<{ error: string | null }>(),
    'Set Current User': props<{ currentUser: IUser }>(),
    'Clear Current User': emptyProps()
  }
});
