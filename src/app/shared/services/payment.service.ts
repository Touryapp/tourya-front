import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { 
  PaymentRequestDto, 
  PaymentResponseDto, 
  WompiResponseDto,
  ShoppingCartResponseDto,
  ShoppingCartItemDto
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
    wompiResponse: WompiResponseDto,
    cartItems: ShoppingCartItemDto[],
    payerInfo: any
  ): Promise<PaymentResponseDto> {
    try {
      const headers = this.getAuthHeaders();
      
      // Preparar payload para la API
      const paymentRequest: PaymentRequestDto = {
        transactionId: wompiResponse.id,
        transactionData: JSON.stringify(wompiResponse), // Todo el objeto de Wompi como string
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
}