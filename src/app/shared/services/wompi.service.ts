import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';
import { ReferenceGenerationResponseDto } from '../dto/payment.dto';
import { AuthService } from '../../core/services/auth.service';

// Interfaces para Wompi
export interface WompiTransactionResult {
  transaction: {
    id: string;
    status: string;
    reference: string;
    amount_in_cents: number;
    currency: string;
    created_at: string;
    finalized_at?: string;
    payment_method_type?: string;
    payment_method?: any;
  };
}

export interface WompiCustomerData {
  email: string;
  fullName: string;
  phoneNumber: string;
  phoneNumberPrefix: string;
  legalId?: string;
  legalIdType?: string;
}

export interface WompiShippingAddress {
  addressLine1: string;
  city: string;
  phoneNumber: string;
  region: string;
  country: string;
}

export interface WompiTaxes {
  vat?: number;
  consumption?: number;
}

export interface WompiCheckoutConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl?: string;
  signature?: {
    integrity: string;
  };
  expirationTime?: string;
  taxInCents?: WompiTaxes;
  customerData?: WompiCustomerData;
  shippingAddress?: WompiShippingAddress;
}

// Declaración global para el script de Wompi
declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class WompiService {
  private scriptLoaded = false;
  private scriptLoadedSubject = new Subject<boolean>();
  
  // Observable para saber cuando el script está cargado
  public scriptLoaded$ = this.scriptLoadedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadWompiScript();
  }

  /**
   * Carga el script de Wompi dinámicamente
   */
  private loadWompiScript(): void {
    // Verificar si el script ya está cargado
    if (window.WidgetCheckout) {
      this.scriptLoaded = true;
      this.scriptLoadedSubject.next(true);
      return;
    }

    // Verificar si ya existe el script en el DOM
    const existingScript = document.querySelector('script[src*="checkout.wompi.co"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        this.scriptLoaded = true;
        this.scriptLoadedSubject.next(true);
      });
      return;
    }

    // Crear y cargar el script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Wompi script loaded successfully');
      this.scriptLoaded = true;
      this.scriptLoadedSubject.next(true);
    };
    
    script.onerror = (error) => {
      console.error('Error loading Wompi script:', error);
      this.scriptLoadedSubject.error('Failed to load Wompi script');
    };
    
    document.head.appendChild(script);
  }

  /**
   * Verifica si el script de Wompi está disponible
   */
  isWompiAvailable(): boolean {
    return this.scriptLoaded && typeof window.WidgetCheckout !== 'undefined';
  }

  /**
   * Espera a que el script de Wompi esté cargado
   */
  waitForWompiScript(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isWompiAvailable()) {
        resolve(true);
        return;
      }

      const subscription = this.scriptLoaded$.subscribe({
        next: (loaded) => {
          if (loaded) {
            subscription.unsubscribe();
            resolve(true);
          }
        },
        error: (error) => {
          subscription.unsubscribe();
          reject(error);
        }
      });

      // Timeout después de 30 segundos
      setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error('Timeout loading Wompi script'));
      }, 30000);
    });
  }

  /**
   * Procesa un pago usando Wompi Widget
   */
  async processPayment(config: WompiCheckoutConfig): Promise<WompiTransactionResult> {
    try {
      // Esperar a que el script esté cargado
      await this.waitForWompiScript();

      console.log('🚀 Iniciando pago con Wompi:', config);

      return new Promise((resolve, reject) => {
        try {
          // Crear instancia del checkout
          const checkout = new window.WidgetCheckout(config);
          
          // Abrir el widget
          checkout.open((result: WompiTransactionResult) => {
            console.log('✅ Resultado del pago Wompi:', result);
            
            if (result.transaction) {
              resolve(result);
            } else {
              reject(new Error('No transaction data received from Wompi'));
            }
          });

        } catch (error) {
          console.error('❌ Error creando checkout Wompi:', error);
          reject(error);
        }
      });

    } catch (error) {
      console.error('❌ Error en processPayment:', error);
      throw error;
    }
  }

  /**
   * Genera una referencia única para la transacción
   */
  generateReference(prefix: string = 'TOURYA'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('🆔 Generando referencia:', {
      prefix,
      timestamp,
      random
    });
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Valida la configuración antes de enviar a Wompi
   */
  validateConfig(config: WompiCheckoutConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validaciones obligatorias
    if (!config.currency) errors.push('Currency is required');
    if (!config.amountInCents || config.amountInCents <= 0) errors.push('Amount must be greater than 0');
    if (!config.reference) errors.push('Reference is required');
    if (!config.publicKey) errors.push('Public key is required');

    // Validar currency
    if (config.currency && config.currency !== 'COP') {
      errors.push('Only COP currency is supported');
    }

    // Validar amount (mínimo 1000 centavos = $10 COP)
    if (config.amountInCents && config.amountInCents < 1000) {
      errors.push('Minimum amount is $10 COP (1000 centavos)');
    }

    // Validar customer data si está presente
    if (config.customerData) {
      const { email, fullName, phoneNumber } = config.customerData;
      
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
      }
      
      if (fullName && fullName.trim().length < 2) {
        errors.push('Full name must be at least 2 characters');
      }
      
      if (phoneNumber && !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
        errors.push('Phone number must have 10 digits');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatea el precio para mostrar en UI
   */
  formatPrice(amountInCents: number): string {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Convierte precio de COP a centavos
   */
  copToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convierte centavos a COP
   */
  centsToCop(amountInCents: number): number {
    return amountInCents / 100;
  }

  /**
   * Calcula el signature de integridad para Wompi
   * Fórmula: SHA256(reference + amountInCents + currency + integrityKey)
   */
  calculateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
    const integrityKey = environment.wompi.integrityKey;
    
    // Concatenar en el orden exacto que requiere Wompi
    const dataToHash = `${reference}${amountInCents}${currency}${integrityKey}`;
    
    // Calcular SHA256
    const signature = CryptoJS.SHA256(dataToHash).toString(CryptoJS.enc.Hex);
    
    console.log('🔐 Signature calculation:', {
      reference,
      amountInCents,
      currency,
      integrityKey: integrityKey.substring(0, 10) + '...',
      dataToHash: dataToHash.substring(0, 50) + '...',
      signature
    });
    
    return signature;
  }

  /**
   * Genera el objeto signature completo para Wompi
   */
  generateSignature(reference: string, amountInCents: number, currency: string): { integrity: string } {
    const integrity = this.calculateIntegritySignature(reference, amountInCents, currency);
    return { integrity };
  }

  /**
   * Obtener headers de autenticación
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Generar referencia y hash usando endpoint del backend
   */
  async generateReferenceAndHash(amountInCents: number, currency: string = 'COP'): Promise<ReferenceGenerationResponseDto> {
    try {
      const headers = this.getAuthHeaders();
      
      const url = `${environment.apiUrl}/reference/generate`;
      const params = new URLSearchParams({
        amountInCents: amountInCents.toString(),
        currency: currency
      });

      console.log('🔐 Generando referencia y hash desde backend:', {
        amountInCents,
        currency,
        url: `${url}?${params.toString()}`
      });

      const response = await this.http.get<ReferenceGenerationResponseDto>(
        `${url}?${params.toString()}`,
        { headers }
      ).toPromise();

      console.log('✅ Referencia y hash generados desde backend:', response);
      return response!;

    } catch (error) {
      console.error('❌ Error generando referencia y hash desde backend:', error);
      throw error;
    }
  }

  /**
   * Generar referencia y signature usando endpoint del backend
   */
  async generateReferenceAndSignature(amountInCents: number, currency: string = 'COP'): Promise<{
    reference: string;
    signature: { integrity: string };
  }> {
    try {
      // Llamar al endpoint del backend en lugar de generar localmente
      const response = await this.generateReferenceAndHash(amountInCents, currency);
      
      return {
        reference: response.reference,
        signature: {
          integrity: response.sha256_hash
        }
      };
    } catch (error) {
      console.error('❌ Error generando referencia y signature desde backend:', error);
      console.warn('⚠️ Usando fallback - generando referencia y signature localmente');
      
      // Fallback a generación local si hay error
      const reference = this.generateReference('TOURYA');
      const signature = this.generateSignature(reference, amountInCents, currency);
      
      return { reference, signature };
    }
  }
}