import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { RescheduleReservationRequest } from '../../models/reservation.model';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

export interface RescheduleConfirmationData {
  reservationId: string | number;
  tourName: string;
  newDate: string;
  newTime: string;
  slotId: number;
  startTime: string;
  endTime: string;
  participants: { label: string; quantity: number }[];
  configQuantity: { ageType: string; quantity: number }[];
  newTotalPrice: number;
  originalPrice: number;
  groupCount?: number;
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
    private reservationService: ReservationService,
    private router: Router
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

    const body: RescheduleReservationRequest = {
      newDate: this.data.newDate,
      slotId: this.data.slotId,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      configQuantity: this.data.configQuantity,
      ...(this.data.groupCount != null && { groupCount: this.data.groupCount })
    };

    this.reservationService.rescheduleReservation(numericId, body).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.dialogRef.close(true);
        
        // Notificar que la reserva ha sido actualizada para que la lista se refresque
        // this.reservationService.notifyReservationUpdated(); // Se movió al final del Swal
        
        const formattedDate = dayjs(this.data.newDate).format('DD/MM/YYYY');
        
        let successMessageHtml = `
            <div style="text-align: center;">
              <p>Tu reserva ha sido reagendada correctamente.</p>
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0; color: #0369a1;">
                  <strong>📅 Nueva fecha:</strong> ${formattedDate}
                </p>
                <p style="margin: 5px 0; color: #0369a1;">
                  <strong>⏰ Horario:</strong> ${this.data.newTime}
                </p>
              </div>
            </div>
          `;

        // Si el reagendamiento tiene un costo mayor (HIGHER) al original
        if (response && response.priceComparison === 'HIGHER') {
          successMessageHtml = `
            <div style="text-align: center;">
              <p>Tu reserva ha sido reagendada correctamente.</p>
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0; color: #0369a1;">
                  <strong>📅 Nueva fecha:</strong> ${formattedDate}
                </p>
                <p style="margin: 5px 0; color: #0369a1;">
                  <strong>⏰ Horario:</strong> ${this.data.newTime}
                </p>
              </div>
              <p style="margin-top: 15px; font-size: 0.95em; color: #555;">
                Te llevaremos al carrito para que hagas el pago del excedente y así poder disfrutar de tu reserva en la nueva fecha <strong>${formattedDate}</strong>.
              </p>
            </div>
          `;
        }
        
        Swal.fire({
          icon: 'success',
          title: '¡Reagendamiento Exitoso!',
          html: successMessageHtml,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          // Notificar que la reserva ha sido actualizada para que la lista se refresque
          this.reservationService.notifyReservationUpdated();

          // Navegar dependiendo de la respuesta, o dejar que el componente padre actualice
          if (response && response.priceComparison === 'HIGHER') {
            // El usuario indicó que debemos ir a /clients/list-tours?city=453
            // Agregamos un queryParam de apoyo (ej. action=pay-reschedule) por si luego
            // se quiere detectar esto y abrir el carrito automáticamente en ese componente.
            this.router.navigate(['/clients/list-tours'], { 
              queryParams: { city: '453', action: 'pay-reschedule' } 
            });
          } else {
            // El componente padre (donde se abrió el modal) debería
            // escuchar el "true" que mandamos arriba con this.dialogRef.close(true)
            // y actualizar la lista de reservas localmente sin hacer F5.
          }
        });
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('❌ Error de reagendamiento:', error);
        
        // Extraer el mensaje de error del campo "error" o fallbacks
        let errorMessage = 'No se pudo reagendar la reserva. Por favor, intenta nuevamente.';
        
        if (error.error && typeof error.error === 'object') {
          // Si el campo "error" existe (como indicó el usuario)
          if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al reagendar',
          text: errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
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
