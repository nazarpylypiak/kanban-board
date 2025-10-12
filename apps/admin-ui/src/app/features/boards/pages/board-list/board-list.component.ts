import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IBoard } from '@kanban-board/shared';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import {
  createBoard,
  deleteBoard,
  loadBoards,
  updateBoard
} from '../../../../core/store/boards/boards.actions';
import { selectAllBoards } from '../../../../core/store/boards/boards.selectors';
import { ConfirmDialogComponent } from '../../../../shared/dialogs/confirm-dialog.component';
import { CreateBoardDialogComponent } from '../../dialogs/create-board-dialog/create-board-dialog.component';

@Component({
  selector: 'app-board-list',
  imports: [AsyncPipe],
  templateUrl: './board-list.component.html',
  styleUrl: './board-list.component.scss'
})
export class BoardListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);
  boards$ = this.store.select(selectAllBoards);

  constructor() {
    this.store.dispatch(loadBoards());
  }

  createNewBoard(board?: IBoard) {
    const dialogRef = this.dialog.open<
      CreateBoardDialogComponent,
      { board?: IBoard },
      { name: string }
    >(CreateBoardDialogComponent, {
      data: { board }
    });

    dialogRef
      .afterClosed()
      .pipe(filter((r): r is { name: string } => !!r))
      .subscribe({
        next: (res) => {
          if (dialogRef.componentInstance.editMode && board?.id) {
            this.store.dispatch(updateBoard({ board: { ...board, ...res } }));
          } else {
            this.store.dispatch(createBoard(res));
          }
        }
      });
  }

  deleteBoard(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(filter((v) => !!v))
      .subscribe(() => {
        this.store.dispatch(deleteBoard({ id }));
      });
  }
}
