import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { 
  PaymentRequestDto, 
  PaymentResponseDto, 
  WompiResponseDto,
  ShoppingCartResponseDto,
  ShoppingCartItemDto,
  DeliveryStatus
} from '../dto/payment.dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtener carrito del usuario desde backend
   */
  async getUserShoppingCart(): Promise<ShoppingCartResponseDto> {
    try {
      const headers = this.getAuthHeaders();
      
      const response = await this.http.get<ShoppingCartResponseDto>(
        `${environment.apiUrl}/shopping-cart/user`,
        { headers }
      ).toPromise();

      console.log('Shopping cart loaded:', response);
      return response!;
      
    } catch (error) {
      console.error('Error loading shopping cart:', error);
      throw error;
    }
  }

  /**
   * Procesar pago tras éxito en Wompi
   * @param wompiResponse - Respuesta completa de Wompi
   * @param cartItems - Items del carrito a procesar
   * @param payerInfo - Información del pagador
   */
  async processPayment(
    wompiResponse: Partial<WompiResponseDto>,
    cartItems: ShoppingCartItemDto[],
    payerInfo: any,
    creditDetails?: { appliedCreditsValue: number; finalTotalToPay: number; selectedCredits: number[] }
  ): Promise<PaymentResponseDto> {
    try {
      const headers = this.getAuthHeaders();
      
      // Determinar qué tipo de pago es y los montos relativos
      let paymentType: 'PLATFORM' | 'CREDIT' | 'CREDIT_AND_PLATFORM' = 'PLATFORM';
      
      // Intentar obtener el monto de Wompi (puede venir en snake_case o camelCase)
      const wompiAmount = wompiResponse.amount_in_cents || wompiResponse['amountInCents'] || 0;
      let amountPlatform = wompiAmount / 100;
      let amountCredit = 0;
      let creditData: { creditIds: number[] } | undefined = undefined;

      // Si tenemos detalles de crédito, usamos los valores calculados en el frontend como prioridad
      if (creditDetails) {
        amountCredit = creditDetails.appliedCreditsValue || 0;
        // El monto de plataforma es lo que sobra por pagar (puede ser 0 si es 100% crédito)
        amountPlatform = creditDetails.finalTotalToPay;
        
        if (creditDetails.selectedCredits && creditDetails.selectedCredits.length > 0) {
          creditData = { creditIds: creditDetails.selectedCredits };
          
          if (amountPlatform === 0) {
            paymentType = 'CREDIT';
          } else {
            paymentType = 'CREDIT_AND_PLATFORM';
          }
        } else {
          paymentType = 'PLATFORM';
        }
      } else {
        // Fallback si no hay creditDetails (pago estándar sin tocar créditos)
        paymentType = 'PLATFORM';
      }

      // Preparar payload para la API
      const paymentRequest: PaymentRequestDto = {
        transactionId: wompiResponse.id || `CREDIT-PAYMENT-${new Date().getTime()}`,
        transactionData: paymentType === 'CREDIT' ? null : JSON.stringify(wompiResponse),
        paymentType,
        amountCredit,
        amountPlatform,
        creditData,
        items: cartItems.map(item => ({
          shoppingCartItemId: item.id,
          serviceResponsible: {
            name: "Tourya Support", // TODO: Obtener de configuración o item
            email: "support@tourya.com", // TODO: Obtener de configuración
            phone: "+57 300 123 4567" // TODO: Obtener de configuración
          }
        })),
        payer: this.createPayerData(payerInfo)
      };

      console.log('Procesando pago con Wompi response:', wompiResponse);
      console.log('Payment request payload:', paymentRequest);

      const response = await this.http.post<PaymentResponseDto>(
        `${environment.apiUrl}/payment`,
        paymentRequest,
        { headers }
      ).toPromise();

      console.log('Payment API response:', response);
      return response!;

    } catch (error) {
      console.error('Error procesando pago:', error);
      throw error;
    }
  }

  /**
   * Configurar headers de autenticación
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Crear datos del pagador desde información del usuario
   */
  createPayerData(userInfo: any): any {
    return {
      name: userInfo.fullName || userInfo.firstName + ' ' + userInfo.lastName || userInfo.name || 'Usuario',
      email: userInfo.email || 'user@tourya.com',
      id: userInfo.id || userInfo.userId || 1,
      phone: userInfo.phone || '+57 300 000 0000',
      documentType: userInfo.documentType || 'CC',
      documentNumber: userInfo.documentNumber || '00000000'
    };
  }

  /**
   * Parsear datos de transacción de Wompi
   */
  parseWompiTransactionData(transactionData: string): WompiResponseDto | null {
    try {
      return JSON.parse(transactionData);
    } catch (error) {
      console.error('Error parsing Wompi transaction data:', error);
      return null;
    }
  }

  /**
   * Formatear precio en COP
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) {
      console.warn('⚠️ formatDate: dateString vacío o undefined');
      return 'Fecha no disponible';
    }
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('❌ formatDate: Fecha inválida -', dateString);
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ formatDate: Error formateando fecha -', dateString, error);
      return 'Error en fecha';
    }
  }

  /**
   * Obtener etiqueta del estado de entrega
   */
  getDeliveryStatusLabel(status: DeliveryStatus | string): string {
    const labels: Record<string, string> = {
      [DeliveryStatus.PENDING]: 'Pendiente',
      [DeliveryStatus.CONFIRMED]: 'Confirmado',
      [DeliveryStatus.DELIVERED]: 'Entregado',
      [DeliveryStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  /**
   * Obtener clase CSS del estado de entrega
   */
  getDeliveryStatusClass(status: DeliveryStatus | string): string {
    const classes: Record<string, string> = {
      [DeliveryStatus.PENDING]: 'badge-warning',
      [DeliveryStatus.CONFIRMED]: 'badge-info',
      [DeliveryStatus.DELIVERED]: 'badge-success',
      [DeliveryStatus.CANCELLED]: 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }

  /**
   * Obtener icono del estado de entrega
   */
  getDeliveryStatusIcon(status: DeliveryStatus | string): string {
    const icons: Record<string, string> = {
      [DeliveryStatus.PENDING]: 'fa-clock',
      [DeliveryStatus.CONFIRMED]: 'fa-check-circle',
      [DeliveryStatus.DELIVERED]: 'fa-check-double',
      [DeliveryStatus.CANCELLED]: 'fa-times-circle'
    };
    return icons[status] || 'fa-question-circle';
  }
}