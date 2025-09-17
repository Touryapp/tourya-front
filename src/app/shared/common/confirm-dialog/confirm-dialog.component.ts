import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  title: string = '';
  message: string = '';
  confirmText: string = 'Confirmar';
  cancelText: string = 'Cancelar';
  confirmColor: string = 'primary';
  confirmed: boolean = false;

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    if (this.bsModalRef.content) {
      const data = this.bsModalRef.content as any;
      this.title = data.title || this.title;
      this.message = data.message || this.message;
      this.confirmText = data.confirmText || this.confirmText;
      this.cancelText = data.cancelText || this.cancelText;
      this.confirmColor = data.confirmColor || this.confirmColor;
    }
  }

  onCancel(): void {
    this.confirmed = false;
    this.bsModalRef.hide();
  }

  onConfirm(): void {
    this.confirmed = true;
    this.bsModalRef.hide();
  }
}
