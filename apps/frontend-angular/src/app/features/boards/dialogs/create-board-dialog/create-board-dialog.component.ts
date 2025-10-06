import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IBoard } from '../../../../../../../../libs/shared/src';

@Component({
  selector: 'app-create-board-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './create-board-dialog.component.html',
  styleUrl: './create-board-dialog.component.scss'
})
export class CreateBoardDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CreateBoardDialogComponent>);
  private data = inject<{ board?: IBoard }>(MAT_DIALOG_DATA);
  editMode = false;

  form = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    if (this.data?.board) {
      this.editMode = true;
      this.form.patchValue({ name: this.data.board.name });
    }
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
