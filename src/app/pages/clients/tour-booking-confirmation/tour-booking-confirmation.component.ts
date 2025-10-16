import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentResponseDto, WompiResponseDto } from '../../../shared/dto/payment.dto';
import { PaymentService } from '../../../shared/services/payment.service';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-tour-booking-confirmation',
  standalone: false,
  templateUrl: './tour-booking-confirmation.component.html',
  styleUrls: ['./tour-booking-confirmation.component.scss']
})
export class TourBookingConfirmationComponent implements OnInit {

  public routes = routes;
  reservationData: PaymentResponseDto | null = null;
  wompiData: WompiResponseDto | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Obtener datos de la reservación desde navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state && state['reservationData']) {
      this.reservationData = state['reservationData'];
      this.wompiData = this.parseWompiData();
      this.loading = false;
      console.log('Reservation data loaded:', this.reservationData);
      console.log('Wompi data parsed:', this.wompiData);
    } else {
      console.log('No reservation data found, loading mock data for testing');
      // Cargar datos mock para testing/maquetación
      this.loadMockData();
      this.loading = false;
    }
  }

  /**
   * Parsear transactionData de Wompi
   */
  private parseWompiData(): WompiResponseDto | null {
    if (!this.reservationData?.transactionData) return null;
    return this.paymentService.parseWompiTransactionData(this.reservationData.transactionData);
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(dateString: string): string {
    return this.paymentService.formatDate(dateString);
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return this.paymentService.formatPrice(price);
  }

  /**
   * Obtener status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge-warning';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  /**
   * Obtener status text
   */
  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pendiente';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  /**
   * Navegar a mis reservas
   */
  goToMyReservations(): void {
    // TODO: Implementar navegación a mis reservas cuando esté disponible
    console.log('Navegating to my reservations...');
    this.router.navigate(['/clients/list-tours']);
  }

  /**
   * Descargar QR code
   */
  downloadQR(): void {
    if (this.reservationData?.reservation?.qrUrl) {
      const link = document.createElement('a');
      link.href = this.reservationData.reservation.qrUrl;
      link.download = `reservation-${this.reservationData.reservation.reservationId}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Compartir QR code
   */
  shareQR(): void {
    if (navigator.share && this.reservationData?.reservation?.qrUrl) {
      navigator.share({
        title: 'Mi Reserva - Tourya',
        text: `Reserva #${this.reservationData.reservation.reservationId}`,
        url: this.reservationData.reservation.qrUrl
      }).catch(console.error);
    } else {
      // Fallback: copiar link al clipboard
      if (this.reservationData?.reservation?.qrUrl) {
        navigator.clipboard.writeText(this.reservationData.reservation.qrUrl)
          .then(() => alert('Link del QR copiado al portapapeles'))
          .catch(() => console.error('Error copying to clipboard'));
      }
    }
  }

  /**
   * Imprimir confirmación
   */
  printConfirmation(): void {
    window.print();
  }

  /**
   * Obtener el total del pago desde Wompi data
   */
  getTotalFromWompi(): number {
    if (this.wompiData?.amount_in_cents) {
      return this.wompiData.amount_in_cents / 100; // Convertir centavos a pesos
    }
    return 0;
  }

  /**
   * Obtener método de pago desde Wompi
   */
  getPaymentMethod(): string {
    if (this.wompiData?.payment_method_type) {
      const method = this.wompiData.payment_method_type;
      switch (method.toLowerCase()) {
        case 'card': return 'Tarjeta de Crédito/Débito';
        case 'pse': return 'PSE';
        case 'bancolombia_transfer': return 'Transferencia Bancolombia';
        case 'nequi': return 'Nequi';
        default: return method;
      }
    }
    return 'No especificado';
  }

  /**
   * Cargar datos mock para testing/maquetación
   */
  private loadMockData(): void {
    this.reservationData = {
      paymentId: 12345,
      transactionId: 'TXN-WOMPI-987654321',
      createdDate: '2024-12-15T10:28:00Z',
      lastModifiedDate: '2024-12-15T10:30:00Z',
      createdBy: 1,
      lastModifiedBy: 1,
      reservation: {
        reservationId: 1234,
        paymentId: 12345,
        reservationDate: '2024-12-15T10:30:00Z',
        deliveryStatus: 'PENDING',
        qrUrl: 'https://tourya-tours-dev.s3.amazonaws.com/reservations/10/1759188797757_reservation_10_qr.png',
        createdDate: '2024-12-15T10:30:00Z',
        lastModifiedDate: '2024-12-15T10:30:00Z',
        createdBy: 1,
        lastModifiedBy: 1,
        items: [
          {
            shoppingCartItemId: 789,
            serviceResponsible: {
              name: 'EcoTours Colombia - Tour Cartagena',
              email: 'cartagena@ecotours.com.co',
              phone: '+57 300 123 4567'
            }
          },
          {
            shoppingCartItemId: 790,
            serviceResponsible: {
              name: 'Aventura Tours - Rafting San Gil',
              email: 'rafting@aventuratours.com',
              phone: '+57 310 987 6543'
            }
          },
          {
            shoppingCartItemId: 791,
            serviceResponsible: {
              name: 'Coffee Tours - Eje Cafetero',
              email: 'info@coffeetours.co',
              phone: '+57 320 456 7890'
            }
          }
        ]
      },
      payer: {
        id: 456,
        name: 'María José González',
        email: 'maria.gonzalez@email.com',
        phone: '+57 301 987 6543',
        documentType: 'CC',
        documentNumber: '1234567890'
      },
      transactionData: JSON.stringify({
        id: '12345-wompi-test-67890',
        status: 'APPROVED',
        amount_in_cents: 45500000, // $455.000 COP
        currency: 'COP',
        customer_email: 'maria.gonzalez@email.com',
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          extra: {
            name: 'VISA',
            last_four: '4242'
          }
        },
        created_at: '2024-12-15T10:28:30Z',
        finalized_at: '2024-12-15T10:30:15Z',
        reference: 'REF-ECOTOUR-CARTAGENA-001'
      })
    };

    // Parsear datos de Wompi mock
    this.wompiData = this.parseWompiData();
    
    console.log('✅ Mock data loaded successfully for maquetación:', this.reservationData);
    console.log('✅ Wompi mock data parsed:', this.wompiData);
  }
}