import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReservationService } from '../../services/reservation.service';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

export interface RescheduleConfirmationData {
  reservationId: string | number;
  tourName: string;
  newDate: string;
  newTime: string;
  participants: { label: string; quantity: number }[];
  newTotalPrice: number;
  originalPrice: number;
}

@Component({
  selector: 'app-reschedule-confirmation-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './reschedule-confirmation-modal.component.html',
  styleUrls: ['./reschedule-confirmation-modal.component.scss']
})
export class RescheduleConfirmationModalComponent {
  isProcessing: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<RescheduleConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RescheduleConfirmationData,
    private reservationService: ReservationService
  ) {}

  closeModal(): void {
    this.dialogRef.close(false);
  }

  confirmReschedule(): void {
    this.isProcessing = true;
    
    // Extraer ID numérico si viene con formato RES-
    const numericId = typeof this.data.reservationId === 'string'
      ? this.data.reservationId.replace('RES-', '')
      : this.data.reservationId;

    this.reservationService.rescheduleReservation(numericId, this.data.newDate).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.dialogRef.close(true);
        
        Swal.fire({
          icon: 'success',
          title: '¡Reagendamiento Exitoso!',
          html: `
            <div style="text-align: center;">
              <p>Tu reserva ha sido reagendada correctamente.</p>
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0; color: #0369a1;">
                  <strong>📅 Nueva fecha:</strong> ${dayjs(this.data.newDate).format('DD/MM/YYYY')}
                </p>
                <p style="margin: 5px 0; color: #0369a1;">
                  <strong>⏰ Horario:</strong> ${this.data.newTime}
                </p>
              </div>
            </div>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          // Recargar la página o manejar la navegación si es necesario
          window.location.reload();
        });
      },
      error: (error) => {
        this.isProcessing = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'No se pudo reagendar la reserva. Por favor, intenta nuevamente.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  formatDate(date: string): string {
    return dayjs(date).format('DD [de] MMMM [de] YYYY');
  }
}
