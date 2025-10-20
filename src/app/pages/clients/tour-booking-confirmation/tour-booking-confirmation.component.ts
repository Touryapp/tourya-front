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
  ) {
    // Obtener datos de la navegación EN EL CONSTRUCTOR
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state && state['reservationData']) {
      this.reservationData = state['reservationData'];
      console.log('✅ Reservation data loaded from navigation state:', this.reservationData);
    } else {
      console.log('⚠️ No reservation data found in navigation state');
    }
  }

  ngOnInit(): void {
    // Procesar datos que ya se obtuvieron en el constructor
    if (this.reservationData) {
      this.wompiData = this.parseWompiData();
      this.loading = false;
      console.log('✅ Wompi data parsed:', this.wompiData);
      
      // Debug completo de la estructura de datos
      this.debugReservationData();
    } else {
      console.log('⚠️ Loading mock data for testing');
      this.loadMockData();
      this.loading = false;
    }
  }

  /**
   * Debug completo de la estructura de datos recibidos
   */
  private debugReservationData(): void {
    console.log('=== 🔍 DEBUG RESERVATION DATA ===');
    console.log('reservationData completo:', this.reservationData);
    console.log('---');
    console.log('paymentId:', this.reservationData?.paymentId);
    console.log('transactionId:', this.reservationData?.transactionId);
    console.log('createdDate:', this.reservationData?.createdDate);
    console.log('---');
    console.log('transactionData (string):', this.reservationData?.transactionData);
    console.log('---');
    
    if (this.reservationData?.transactionData) {
      try {
        const parsed = JSON.parse(this.reservationData.transactionData);
        console.log('transactionData (parsed):', parsed);
        console.log('  - amount_in_cents:', parsed.amount_in_cents);
        console.log('  - amountInCents:', parsed.amountInCents);
        console.log('  - payment_method_type:', parsed.payment_method_type);
        console.log('  - paymentMethodType:', parsed.paymentMethodType);
        console.log('  - createdAt:', parsed.createdAt);
        console.log('  - created_at:', parsed.created_at);
        console.log('  - finalizedAt:', parsed.finalizedAt);
        console.log('  - finalized_at:', parsed.finalized_at);
      } catch (e) {
        console.error('Error parseando transactionData:', e);
      }
    }
    
    console.log('---');
    console.log('wompiData:', this.wompiData);
    console.log('getTotalFromWompi():', this.getTotalFromWompi());
    console.log('getPaymentMethod():', this.getPaymentMethod());
    console.log('=== FIN DEBUG ===');
  }

  /**
   * Parsear transactionData de Wompi
   */
  private parseWompiData(): WompiResponseDto | null {
    if (!this.reservationData?.transactionData) {
      console.warn('⚠️ No hay transactionData en reservationData');
      return null;
    }
    
    try {
      const parsed = this.paymentService.parseWompiTransactionData(this.reservationData.transactionData);
      console.log('✅ Wompi data parseada exitosamente:', parsed);
      
      // Asegurar que las fechas están presentes en ambos formatos (camelCase y snake_case)
      if (parsed) {
        // Si tiene createdAt pero no created_at, agregar created_at
        if ((parsed as any).createdAt && !(parsed as any).created_at) {
          (parsed as any).created_at = (parsed as any).createdAt;
        }
        // Si tiene created_at pero no createdAt, agregar createdAt
        if ((parsed as any).created_at && !(parsed as any).createdAt) {
          (parsed as any).createdAt = (parsed as any).created_at;
        }
        
        // Lo mismo para finalizedAt
        if ((parsed as any).finalizedAt && !(parsed as any).finalized_at) {
          (parsed as any).finalized_at = (parsed as any).finalizedAt;
        }
        if ((parsed as any).finalized_at && !(parsed as any).finalizedAt) {
          (parsed as any).finalizedAt = (parsed as any).finalized_at;
        }
        
        console.log('✅ Fechas normalizadas en wompiData:', {
          createdAt: (parsed as any).createdAt,
          created_at: (parsed as any).created_at,
          finalizedAt: (parsed as any).finalizedAt,
          finalized_at: (parsed as any).finalized_at
        });
      }
      
      return parsed;
    } catch (error) {
      console.error('❌ Error parseando Wompi data:', error);
      console.error('transactionData recibido:', this.reservationData.transactionData);
      return null;
    }
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(dateString: string | undefined | null): string {
    if (!dateString) {
      console.warn('⚠️ dateString vacío, undefined o null:', dateString);
      return 'Fecha no disponible';
    }
    
    try {
      // Si es una fecha ISO con zona horaria (ejemplo: "2025-10-18T00:12:17.017701382")
      // O formato Wompi (ejemplo: "2025-10-18T00:12:13.500Z")
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('❌ Fecha inválida después de parsear:', dateString);
        return 'Fecha inválida';
      }
      
      // Formatear la fecha usando el servicio
      const formatted = this.paymentService.formatDate(dateString);
      console.log('✅ Fecha formateada:', dateString, '->', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ Error formateando fecha:', dateString, error);
      return 'Fecha inválida';
    }
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
    console.log('🔍 getTotalFromWompi - wompiData:', this.wompiData);
    
    // Opción 1: Parsear directamente del transactionData (más confiable)
    if (this.reservationData?.transactionData) {
      try {
        const data = JSON.parse(this.reservationData.transactionData);
        console.log('🔍 transactionData parseado:', data);
        
        // Primero intentar amountInCents (camelCase)
        if (data.amountInCents) {
          const total = data.amountInCents / 100;
          console.log('✅ Total desde transactionData.amountInCents:', total);
          return total;
        }
        
        // Luego intentar amount_in_cents (snake_case)
        if (data.amount_in_cents) {
          const total = data.amount_in_cents / 100;
          console.log('✅ Total desde transactionData.amount_in_cents:', total);
          return total;
        }
      } catch (e) {
        console.error('❌ Error parseando transactionData para obtener total:', e);
      }
    }
    
    // Opción 2: Desde wompiData parseado (amount_in_cents)
    if (this.wompiData?.amount_in_cents) {
      const total = this.wompiData.amount_in_cents / 100;
      console.log('✅ Total desde wompiData.amount_in_cents:', total);
      return total;
    }
    
    // Opción 3: Desde amountInCents (formato alternativo)
    if (this.wompiData && (this.wompiData as any).amountInCents) {
      const total = (this.wompiData as any).amountInCents / 100;
      console.log('✅ Total desde wompiData.amountInCents:', total);
      return total;
    }
    
    console.warn('⚠️ No se pudo obtener el total, devolviendo 0');
    return 0;
  }

  /**
   * Obtener método de pago desde Wompi
   */
  getPaymentMethod(): string {
    console.log('🔍 getPaymentMethod - wompiData:', this.wompiData);
    
    let paymentMethodType = null;
    
    // Opción 1: Parsear directamente del transactionData (más confiable)
    if (this.reservationData?.transactionData) {
      try {
        const data = JSON.parse(this.reservationData.transactionData);
        console.log('🔍 transactionData parseado para método:', data);
        
        // Primero intentar paymentMethodType (camelCase)
        if (data.paymentMethodType) {
          paymentMethodType = data.paymentMethodType;
          console.log('✅ Método de pago desde transactionData.paymentMethodType:', paymentMethodType);
        }
        // Luego intentar payment_method_type (snake_case)
        else if (data.payment_method_type) {
          paymentMethodType = data.payment_method_type;
          console.log('✅ Método de pago desde transactionData.payment_method_type:', paymentMethodType);
        }
      } catch (e) {
        console.error('❌ Error parseando transactionData para obtener método:', e);
      }
    }
    
    // Opción 2: Desde wompiData parseado
    if (!paymentMethodType && this.wompiData?.payment_method_type) {
      paymentMethodType = this.wompiData.payment_method_type;
      console.log('✅ Método de pago desde wompiData.payment_method_type:', paymentMethodType);
    }
    
    // Opción 3: Desde paymentMethodType en wompiData
    if (!paymentMethodType && this.wompiData && (this.wompiData as any).paymentMethodType) {
      paymentMethodType = (this.wompiData as any).paymentMethodType;
      console.log('✅ Método de pago desde wompiData.paymentMethodType:', paymentMethodType);
    }
    
    // Convertir al formato legible
    if (paymentMethodType) {
      const method = paymentMethodType.toLowerCase();
      switch (method) {
        case 'card': 
          return 'Tarjeta de Crédito/Débito';
        case 'pse': 
          return 'PSE';
        case 'bancolombia_transfer':
        case 'bancolombia_collect':
          return 'Transferencia Bancolombia';
        case 'nequi': 
          return 'Nequi';
        case 'daviplata':
          return 'Daviplata';
        default: 
          // Capitalizar primera letra y reemplazar guiones bajos
          return paymentMethodType.charAt(0).toUpperCase() + paymentMethodType.slice(1).replace(/_/g, ' ');
      }
    }
    
    console.warn('⚠️ No se pudo obtener el método de pago');
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