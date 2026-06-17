import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentResponseDto, WompiResponseDto, ReservationDto, DeliveryStatus } from '../../../shared/dto/payment.dto';
import { PaymentService } from '../../../shared/services/payment.service';
import { ReservationService } from '../../../shared/services/reservation.service';
import { ClientReservation } from '../../../shared/models/reservation.model';
import { routes } from '../../../shared/routes/routes';
import { TranslateService } from '@ngx-translate/core';

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

  // ✨ Nuevas propiedades para carousel de reservas
  currentReservationIndex: number = 0;
  currentReservation: ReservationDto | null = null;
  totalReservations: number = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private translate: TranslateService
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
    // 1. Verificar si vienen datos del estado de navegación (pago con tarjeta/widget directo)
    if (this.reservationData) {
      this.wompiData = this.parseWompiData();
      this.initializeReservations();
      this.loading = false;
      console.log('✅ Datos cargados desde el estado de navegación');
      this.debugReservationData();
    } else {
      // 2. Verificar si viene un ID por URL (retorno de redirección PSE/Transferencia)
      this.route.queryParams.subscribe(params => {
        const transactionId = params['id'];
        if (transactionId) {
          console.log('🔄 Detectado retorno de Wompi con ID:', transactionId);
          this.recoverTransaction(transactionId);
        } else {
          // 3. Fallback a mock data solo si no hay nada más
          console.log('⚠️ No se detectó transacción, cargando mock data para pruebas');
          this.loadMockData();
          this.loading = false;
        }
      });
    }
  }

  /**
   * Recupera la transacción desde el backend usando el ID de Wompi
   */
  private recoverTransaction(transactionId: string): void {
    this.loading = true;
    console.log('📡 Buscando reservas asociadas a la transacción:', transactionId);

    // Intentar obtener las reservas del cliente y filtrar por transactionId
    this.reservationService.getClientReservations({ page: 0, size: 50 }).subscribe({
      next: (response) => {
        const matchedReservations = response.content.filter(res => res.paymentTransactionId === transactionId);
        
        if (matchedReservations.length > 0) {
          console.log('✅ Reservas encontradas:', matchedReservations);
          this.mapToReservationData(matchedReservations, transactionId);
          this.loading = false;
        } else {
          console.warn('⚠️ No se encontraron reservas aún. El webhook podría estar procesándose.');
          this.error = this.translate.instant('tourBookingSuccess.errors.paymentProcessing');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ Error recuperando reservas:', err);
        this.error = this.translate.instant('tourBookingSuccess.errors.recoveryError');
        this.loading = false;
      }
    });
  }

  /**
   * Mapea ClientReservation (modelo backend) a PaymentResponseDto (modelo frontend esperado aquí)
   */
  private mapToReservationData(clientReservations: ClientReservation[], transactionId: string): void {
    const first = clientReservations[0];
    
    // Construir estructura compatible con lo que el componente ya sabe mostrar
    this.reservationData = {
      paymentId: first.paymentId,
      transactionId: transactionId,
      transactionData: JSON.stringify({
        id: transactionId,
        status: 'APPROVED',
        amount_in_cents: first.shoppingTotalPrice * 100,
        payment_method_type: 'PSE/Transferencia',
        created_at: first.reservationCreatedDate
      }),
      reservations: clientReservations.map(res => ({
        bookingId: res.paymentTransactionId || '',
        reservationId: res.reservationId,
        paymentId: res.paymentId,
        itemId: res.shoppingItemId,
        qrUrl: '',
        reservationDate: res.reservationDate,
        deliveryStatus: res.reservationDeliveryStatus as any,
        serviceResponsible: {
          name: res.serviceResponsibleName,
          email: res.serviceResponsibleEmail,
          phone: res.serviceResponsiblePhone as any
        },
        tourOperator: {
          providerUserId: 0,
          name: res.serviceResponsibleName || '',
          email: res.serviceResponsibleEmail || '',
          phone: res.serviceResponsiblePhone || ''
        },
        createdDate: res.reservationCreatedDate,
        lastModifiedDate: res.reservationCreatedDate,
        createdBy: 0,
        lastModifiedBy: 0,
        payerName: res.payerName || '',
        payerEmail: res.payerEmail || '',
        payerPhone: res.payerPhone || '',
        payerDocumentType: res.payerDocumentType || '',
        payerDocumentNumber: res.payerDocumentNumber || '',
        tourId: res.tourId,
        tourName: res.tourName,
        tourImageUrl: '',
        tourType: res.productType,
        duration: null,
        checkInDate: res.scheduleDate,
        returnDate: null,
        destination: '',
        price: res.shoppingTotalPrice,
        providerTotalAmount: 0,
        priceBreakdown: [],
        travellers: `${res.totalTourists} personas`,
        activities: [],
        extraServices: [],
        maxCancellationDate: res.maxCancellationDate || '',
        maxReschedulingDate: res.maxReschedulingDate || '',
        cancellationReason: null,
        cancellationDate: null,
        credit: null
      })),
      payer: {
        id: 0,
        name: first.payerName,
        email: first.payerEmail,
        phone: first.payerPhone,
        documentType: first.payerDocumentType,
        documentNumber: first.payerDocumentNumber
      },
      createdDate: first.reservationCreatedDate,
      lastModifiedDate: first.reservationCreatedDate,
      createdBy: 0,
      lastModifiedBy: 0,
      totalAmount: first.shoppingTotalPrice,
      amountCredit: null,
      creditsUsed: null
    };

    this.wompiData = this.parseWompiData();
    this.initializeReservations();
  }

  /**
   * ✨ Inicializar reservas desde el array
   */
  private initializeReservations(): void {
    if (this.reservationData?.reservations && this.reservationData.reservations.length > 0) {
      this.totalReservations = this.reservationData.reservations.length;
      this.currentReservationIndex = 0;
      this.currentReservation = this.reservationData.reservations[0];
      console.log(`✅ Inicializadas ${this.totalReservations} reservas. Mostrando reserva #1`);
    } else {
      console.warn('⚠️ No hay reservas en reservationData');
      this.totalReservations = 0;
      this.currentReservation = null;
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
      case 'pending': return this.translate.instant('tourBookingSuccess.status.pending');
      case 'delivered': return this.translate.instant('tourBookingSuccess.status.delivered');
      case 'cancelled': return this.translate.instant('tourBookingSuccess.status.cancelled');
      default: return status;
    }
  }

  /**
   * ✨ Navegar al siguiente reserva en el carousel
   */
  nextReservation(): void {
    if (this.reservationData?.reservations && this.currentReservationIndex < this.totalReservations - 1) {
      this.currentReservationIndex++;
      this.currentReservation = this.reservationData.reservations[this.currentReservationIndex];
      console.log(`➡️ Navegando a reserva ${this.currentReservationIndex + 1}/${this.totalReservations}`);
    }
  }

  /**
   * ✨ Navegar a la reserva anterior en el carousel
   */
  previousReservation(): void {
    if (this.currentReservationIndex > 0) {
      this.currentReservationIndex--;
      this.currentReservation = this.reservationData!.reservations[this.currentReservationIndex];
      console.log(`⬅️ Navegando a reserva ${this.currentReservationIndex + 1}/${this.totalReservations}`);
    }
  }

  /**
   * ✨ Ir a una reserva específica
   */
  goToReservation(index: number): void {
    if (this.reservationData?.reservations && index >= 0 && index < this.totalReservations) {
      this.currentReservationIndex = index;
      this.currentReservation = this.reservationData.reservations[index];
      console.log(`🎯 Navegando a reserva ${index + 1}/${this.totalReservations}`);
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
   * ✨ Descargar QR de la reserva actual
   */
  downloadQR(): void {
    if (this.currentReservation?.qrUrl) {
      const link = document.createElement('a');
      link.href = this.currentReservation.qrUrl;
      link.download = `reservation-${this.currentReservation.reservationId}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`✅ Descargando QR de reserva #${this.currentReservation.reservationId}`);
    } else {
      console.warn('⚠️ No hay QR disponible para descargar');
    }
  }

  /**
   * ✨ Descargar todos los QRs en un ZIP
   */
  async downloadAllQRs(): Promise<void> {
    if (!this.reservationData?.reservations || this.reservationData.reservations.length === 0) {
      console.warn('⚠️ No hay reservas para descargar');
      return;
    }

    console.log(`📦 Descargando ${this.reservationData.reservations.length} QRs...`);

    try {
      // Por ahora, descargar uno por uno
      // TODO: Implementar descarga en ZIP usando JSZip
      for (let i = 0; i < this.reservationData.reservations.length; i++) {
        const reservation = this.reservationData.reservations[i];
        if (reservation.qrUrl) {
          await this.downloadSingleQR(reservation.qrUrl, reservation.reservationId, i);
        }
      }
      
      const successMsg = this.translate.instant('tourBookingSuccess.alerts.downloadSuccess', { count: this.reservationData.reservations.length });
      alert(successMsg);
    } catch (error) {
      console.error('❌ Error descargando QRs:', error);
      alert(this.translate.instant('tourBookingSuccess.alerts.downloadError'));
    }
  }

  /**
   * ✨ Helper para descargar un QR individual
   */
  private downloadSingleQR(qrUrl: string, reservationId: number, index: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `reservation-${reservationId}-qr-${index + 1}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      }, index * 500); // Delay de 500ms entre descargas para evitar bloqueo del navegador
    });
  }

  /**
   * ✨ Compartir QR de la reserva actual
   */
  async shareQR(): Promise<void> {
    if (!this.currentReservation?.qrUrl) {
      console.warn('⚠️ No hay QR disponible para compartir');
      return;
    }

    try {
      if (navigator.share) {
        // Usar Web Share API si está disponible
        await navigator.share({
          title: 'Mi Reserva - Tourya',
          text: `Reserva #${this.currentReservation.reservationId}`,
          url: this.currentReservation.qrUrl
        });
        console.log('✅ QR compartido exitosamente');
      } else {
        // Fallback: copiar al clipboard
        await navigator.clipboard.writeText(this.currentReservation.qrUrl);
        alert(this.translate.instant('tourBookingSuccess.alerts.shareSuccess'));
        console.log('✅ QR URL copiado al portapapeles');
      }
    } catch (error) {
      console.error('❌ Error compartiendo QR:', error);
      alert(this.translate.instant('tourBookingSuccess.alerts.shareError'));
    }
  }

  /**
   * ✨ Obtener clase CSS del badge según estado de entrega
   */
  getDeliveryStatusClass(status: DeliveryStatus | string): string {
    return this.paymentService.getDeliveryStatusClass(status);
  }

  getDeliveryStatusLabelTranslated(status: DeliveryStatus | string): string {
    const keys: Record<string, string> = {
      [DeliveryStatus.PENDING]: 'tourBookingSuccess.status.pending',
      [DeliveryStatus.CONFIRMED]: 'tourBookingSuccess.status.confirmed',
      [DeliveryStatus.DELIVERED]: 'tourBookingSuccess.status.delivered',
      [DeliveryStatus.CANCELLED]: 'tourBookingSuccess.status.cancelled'
    };
    return this.translate.instant(keys[status as string] || status);
  }

  getTourTypeTranslated(tourType: string): string {
    if (!tourType) return '';
    const normalizedType = tourType.toLowerCase().trim();
    const typeMap: Record<string, string> = {
      'acuático': 'tourBookingSuccess.categories.aquatic',
      'terrestre': 'tourBookingSuccess.categories.land',
      'cultura': 'tourBookingSuccess.categories.cultural',
      'aventura': 'tourBookingSuccess.categories.adventure',
      'nocturno': 'tourBookingSuccess.categories.night',
      'experiencias': 'tourBookingSuccess.categories.experiences',
      'alquiler de transporte': 'tourBookingSuccess.categories.transportRental'
    };
    const key = typeMap[normalizedType];
    return key ? this.translate.instant(key) : tourType;
  }

  /**
   * ✨ Obtener icono del estado de entrega
   */
  getDeliveryStatusIcon(status: DeliveryStatus | string): string {
    return this.paymentService.getDeliveryStatusIcon(status);
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
    
    // Opción 2: Desde campos directos del DTO (amountCredit/creditsUsed)
    if (this.reservationData?.totalAmount !== undefined) {
      const total = (this.reservationData.totalAmount || 0) - (this.reservationData.amountCredit || 0);
      console.log('✅ Total calculado desde DTO (totalAmount - amountCredit):', total);
      return total;
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
      amountCredit: null,
      creditsUsed: null,
      reservations: [ // ✨ Ahora es un array con múltiples reservas
        {
          reservationId: 1001,
          bookingId: 'BK-1001',
          paymentId: 12345,
          itemId: 789,
          reservationDate: '2024-12-15T10:30:00Z',
          deliveryStatus: DeliveryStatus.CONFIRMED,
          qrUrl: 'https://tourya-tours-dev.s3.amazonaws.com/reservations/10/qr1.png',
          serviceResponsible: {
            name: 'EcoTours Colombia',
            email: 'cartagena@ecotours.com.co',
            phone: '+57 300 123 4567'
          },
          tourOperator: {
            providerUserId: 1,
            name: 'EcoTours Colombia S.A.S.',
            email: 'operaciones@ecotours.com.co',
            phone: '+57 300 000 0001'
          },
          createdDate: '2024-12-15T10:30:00Z',
          lastModifiedDate: '2024-12-15T10:30:00Z',
          createdBy: 1,
          lastModifiedBy: 1,
          payerName: 'María José González',
          payerEmail: 'maria.gonzalez@email.com',
          payerPhone: '+57 301 987 6543',
          payerDocumentType: 'CC',
          payerDocumentNumber: '1234567890',
          tourId: 36,
          tourName: 'Eco-Aventura en el Archipiélago',
          tourImageUrl: 'https://storage.googleapis.com/tourya-dev-storage/tours/36/1760456194034_cayos1.png',
          tourType: 'Acuático',
          duration: '6 horas',
          checkInDate: '2025-10-20T08:00:00',
          returnDate: '2025-10-20T14:00:00',
          destination: 'Cartagena de Indias',
          price: 185000,
          providerTotalAmount: 160000,
          priceBreakdown: [],
          travellers: '2 Adultos',
          activities: ['Snorkeling', 'Almuerzo típico', 'Transporte en lancha'],
          extraServices: ['Seguro médico', 'Guía bilingüe'],
          maxCancellationDate: '2025-10-18',
          maxReschedulingDate: '2025-10-19',
          cancellationReason: null,
          cancellationDate: null,
          credit: null
        },
        {
          reservationId: 1002,
          bookingId: 'BK-1002',
          paymentId: 12345,
          itemId: 790,
          reservationDate: '2024-12-15T10:30:00Z',
          deliveryStatus: DeliveryStatus.PENDING,
          qrUrl: 'https://tourya-tours-dev.s3.amazonaws.com/reservations/10/qr2.png',
          serviceResponsible: {
            name: 'Aventura Tours',
            email: 'rafting@aventuratours.com',
            phone: '+57 310 987 6543'
          },
          tourOperator: {
            providerUserId: 2,
            name: 'Aventura Tours Ltda.',
            email: 'ops@aventuratours.com',
            phone: '+57 310 000 0002'
          },
          createdDate: '2024-12-15T10:30:00Z',
          lastModifiedDate: '2024-12-15T10:30:00Z',
          createdBy: 1,
          lastModifiedBy: 1,
          payerName: 'María José González',
          payerEmail: 'maria.gonzalez@email.com',
          payerPhone: '+57 301 987 6543',
          payerDocumentType: 'CC',
          payerDocumentNumber: '1234567890',
          tourId: 40,
          tourName: 'Safari Nocturno en la Selva',
          tourImageUrl: 'https://storage.googleapis.com/tourya-dev-storage/tours/36/1760456194034_cayos1.png',
          tourType: 'Terrestre',
          duration: '4 horas',
          checkInDate: '2025-10-21T18:00:00',
          returnDate: '2025-10-21T22:00:00',
          destination: 'Amazonas',
          price: 120000,
          providerTotalAmount: 100000,
          priceBreakdown: [],
          travellers: '2 Adultos',
          activities: ['Caminata nocturna', 'Avistamiento de caimanes'],
          extraServices: ['Linternas', 'Repelente biodegradable'],
          maxCancellationDate: '2025-10-20',
          maxReschedulingDate: '2025-10-21',
          cancellationReason: null,
          cancellationDate: null,
          credit: null
        },
        {
          reservationId: 1003,
          bookingId: 'BK-1003',
          paymentId: 12345,
          itemId: 791,
          reservationDate: '2024-12-15T10:30:00Z',
          deliveryStatus: DeliveryStatus.DELIVERED,
          qrUrl: 'https://tourya-tours-dev.s3.amazonaws.com/reservations/10/qr3.png',
          serviceResponsible: {
            name: 'Coffee Tours',
            email: 'info@coffeetours.co',
            phone: '+57 320 456 7890'
          },
          tourOperator: {
            providerUserId: 3,
            name: 'Coffee Tours del Eje',
            email: 'ops@coffeetours.co',
            phone: '+57 320 000 0003'
          },
          createdDate: '2024-12-15T10:30:00Z',
          lastModifiedDate: '2024-12-15T10:30:00Z',
          createdBy: 1,
          lastModifiedBy: 1,
          payerName: 'María José González',
          payerEmail: 'maria.gonzalez@email.com',
          payerPhone: '+57 301 987 6543',
          payerDocumentType: 'CC',
          payerDocumentNumber: '1234567890',
          tourId: 45,
          tourName: 'Ruta del Café Premium',
          tourImageUrl: 'https://storage.googleapis.com/tourya-dev-storage/tours/36/1760456194034_cayos1.png',
          tourType: 'Cultura',
          duration: '5 horas',
          checkInDate: '2025-10-22T09:00:00',
          returnDate: '2025-10-22T14:00:00',
          destination: 'Quindío',
          price: 150000,
          providerTotalAmount: 130000,
          priceBreakdown: [],
          travellers: '2 Adultos',
          activities: ['Cata de café', 'Recorrido por cafetales'],
          extraServices: ['Transporte desde hotel', 'Kit de degustación'],
          maxCancellationDate: '2025-10-21',
          maxReschedulingDate: '2025-10-22',
          cancellationReason: null,
          cancellationDate: null,
          credit: null
        }
      ],
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
    this.initializeReservations(); // ✨ Inicializar reservas
    
    // Inject mock credits to see UI changes
    if (this.reservationData) {
      this.reservationData.totalAmount = 525000;
      this.reservationData.amountCredit = 70000;
    }

    console.log('✅ Mock data loaded successfully for maquetación:', this.reservationData);
    console.log('✅ Wompi mock data parsed:', this.wompiData);
    console.log(`✅ ${this.totalReservations} reservas mock cargadas`);
  }
}