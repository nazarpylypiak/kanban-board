import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import AuthActions from '../../core/store/auth/auth.actions';
import { selectCurrentUser } from '../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class LayoutComponent {
  private store = inject(Store);

  constructor() {
    this.store.dispatch(AuthActions.fetchCurrentUser());
    this.store.select(selectCurrentUser).subscribe();
  }
}
