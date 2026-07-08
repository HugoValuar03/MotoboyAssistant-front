import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface MessageDialogData {
  message: string;
}

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './message-dialog.html',
  styleUrl: './message-dialog.scss',
})
export class MessageDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData
  ) { }
}
