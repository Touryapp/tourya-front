import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, take } from 'rxjs';
import { routes } from '../../../shared/routes/routes';
import { CartService } from '../../../shared/services/cart.service';
import { CartItem, CartSummary } from '../../../shared/dto/cart.dto';
import { WompiService, WompiCheckoutConfig, WompiTransactionResult } from '../../../shared/services/wompi.service';
import { PaymentService } from '../../../shared/services/payment.service';
import { PaymentResponseDto, WompiResponseDto, ShoppingCartResponseDto } from '../../../shared/dto/payment.dto';
import { environment } from '../../../../environments/environment';

// Interface for traveler information per tour
interface TravelerInfo {
  tourId: string;
  tourName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-cart-summary',
  standalone: false,
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss']
})
export class CartSummaryComponent implements OnInit, OnDestroy {
  public routes = routes;
  
  // Cart data properties
  cartSummary: CartSummary | null = null;
  cartItems: CartItem[] = [];
  loading = false;
  processing = false;

  // Contact information (quien realiza el pago)
  contactForm = {
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    age: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    additionalInfo: ''
  };

  // Traveler information per tour
  travelersInfo: TravelerInfo[] = [];

  // Legacy form for compatibility (will be removed)
  userForm = {
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    age: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    additionalInfo: ''
  };

  // Component lifecycle
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private wompiService: WompiService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    console.log('CartSummary: Iniciando componente...');
    this.loadCartData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del carrito desde el servicio
   */
  private loadCartData(): void {
    this.loading = true;
    
    // Load cart data from backend API
    this.cartService.loadCartFromBackend()
      .then(() => {
        // Subscribe to cart items from service
        this.cartService.cartItems$.pipe(take(1)).subscribe(cartItems => {
          this.cartItems = cartItems;
          this.updateCartSummary();
          
          console.log('CartSummary: Datos del carrito cargados desde API:', cartItems.length, 'items');
          
          if (cartItems.length === 0) {
            console.log('CartSummary: Carrito vacío');
            this.handleEmptyCart();
          } else {
            // Initialize traveler information for each cart item
            this.initializeTravelersInfo();
          }
          
          this.loading = false;
        });
      })
      .catch((error) => {
        console.error('CartSummary: Error cargando datos del carrito:', error);
        
        // Show user-friendly error message
        let errorMessage = 'Error cargando el carrito. Por favor, intenta de nuevo.';
        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          // Redirect to login or show login modal
        }
        
        alert(errorMessage); // TODO: Replace with proper toast/snackbar
        
        // Handle empty cart on error
        this.handleEmptyCart();
        this.loading = false;
      });

    // Obtener items del carrito
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: CartItem[]) => {
          if (items && items.length > 0) {
            this.cartItems = items;
            console.log('CartSummary: Items reales del carrito:', items);
          }
          // Inicializar información de viajeros
          this.initializeTravelersInfo();
        },
        error: (error: any) => {
          console.error('CartSummary: Error cargando items, usando mock data:', error);
        }
      });
  }

  /**
   * Sincronizar contactForm con userForm para compatibilidad legacy
   */
  private syncFormsData(): void {
    console.log('🔄 Sincronizando contactForm → userForm...');
    
    // Sincronizar datos del formulario principal al legacy
    if (this.contactForm) {
      this.userForm.email = this.contactForm.email || this.userForm.email;
      this.userForm.phone = this.contactForm.phone || this.userForm.phone;
      this.userForm.firstName = this.contactForm.firstName || this.userForm.firstName;
      this.userForm.lastName = this.contactForm.lastName || this.userForm.lastName;
      
      console.log('✅ Sincronización completada');
      console.log('📧 Email sincronizado:', this.userForm.email);
      console.log('📱 Phone sincronizado:', this.userForm.phone);
    }
  }

  /**
   * Debug method - imprimir estado completo del formulario
   */
  debugFormState(): void {
    console.log('=== 🔍 DEBUG FORM STATE ===');
    
    console.log('📋 contactForm object:', this.contactForm);
    console.log('📋 contactForm properties:');
    Object.keys(this.contactForm || {}).forEach(key => {
      const value = this.contactForm[key as keyof typeof this.contactForm];
      console.log(`  ${key}: "${value}" (${typeof value}) [length: ${value?.toString().length || 0}]`);
    });
    
    console.log('📋 userForm object (legacy):', this.userForm);
    console.log('📋 userForm properties:');
    Object.keys(this.userForm || {}).forEach(key => {
      const value = this.userForm[key as keyof typeof this.userForm];
      console.log(`  ${key}: "${value}" (${typeof value}) [length: ${value?.toString().length || 0}]`);
    });

    console.log('👥 travelersInfo:', this.travelersInfo);
    console.log('👥 travelersInfo count:', this.travelersInfo.length);
    console.log('👥 completed travelers:', this.getCompletedTravelersCount());
    
    console.log('========================');
  }

  /**
   * Validación del formulario antes de proceder al pago
   */
  private validateForm(): boolean {
    // Validar información de contacto
    const requiredContactFields = ['email', 'phone', 'firstName', 'lastName'];
    
    for (let field of requiredContactFields) {
      if (!this.contactForm[field as keyof typeof this.contactForm]) {
        alert(`Por favor completa el campo: ${field} en Información de Contacto`);
        return false;
      }
    }
    
    // Validar información de viajeros
    if (!this.validateTravelersInfo()) {
      alert('Por favor completa la información de todos los viajeros');
      return false;
    }
    
    // Legacy validation for compatibility
    const requiredFields = ['email', 'phone', 'firstName', 'lastName'];
    
    console.log('🔍 Validando campos obligatorios del userForm...');
    for (let field of requiredFields) {
      const value = this.userForm[field as keyof typeof this.userForm];
      console.log(`  Validando ${field}: "${value}" (${typeof value}) [empty: ${!value}]`);
      
      if (!value) {
        console.error(`❌ Campo requerido faltante: ${field}`);
        console.error(`❌ Valor actual: "${value}"`);
        console.error('❌ userForm completo:', this.userForm);
        alert(`Campo requerido: ${field}`);
        return false;
      }
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValue = this.userForm.email;
    const emailValid = emailRegex.test(emailValue);
    
    console.log(`🔍 Validando formato de email: "${emailValue}"`);
    console.log(`🔍 Email válido: ${emailValid}`);
    
    if (!emailValid) {
      console.error('❌ Formato de email inválido:', emailValue);
      alert('Por favor ingrese un email válido');
      return false;
    }
    
    console.log('✅ Formulario validado exitosamente');
    return true;
  }

  /**
   * Preparar datos para Wompi usando endpoint del backend
   */
  private async prepareWompiData(): Promise<WompiCheckoutConfig> {
    try {
      const totalAmount = this.cartSummary?.totalPrice || 0;
      const amountInCents = this.wompiService.copToCents(totalAmount);
      
      console.log('🔐 Preparando datos de Wompi con backend...');
      
      // Generar referencia y signature desde el backend
      const { reference, signature } = await this.wompiService.generateReferenceAndSignature(
        amountInCents,
        'COP'
      );

      // Preparar shippingAddress con validación
      const shippingAddress = {
        addressLine1: this.userForm.address1 || 'Calle 100 # 15-25, Zona Rosa',
        city: this.userForm.city || 'Bogotá',
        phoneNumber: this.userForm.phone.replace(/\D/g, ''),
        region: this.userForm.state || 'Cundinamarca',
        country: this.userForm.country || 'CO'
      };

      // Log para debug de shippingAddress
      console.log('🏠 ShippingAddress preparado:');
      Object.entries(shippingAddress).forEach(([key, value]) => {
        console.log(`  ${key}: "${value}" [length: ${value.length}]`);
      });

      const wompiConfig: WompiCheckoutConfig = {
        currency: 'COP',
        amountInCents: amountInCents,
        reference: reference,  // ← Desde backend
        publicKey: environment.wompi.publicKey,
        redirectUrl: `${window.location.origin}/clients/payment-confirmation`,
        signature: signature,  // ← Desde backend
        customerData: {
          email: this.userForm.email,
          fullName: `${this.userForm.firstName} ${this.userForm.lastName}`.trim(),
          phoneNumber: this.userForm.phone.replace(/\D/g, ''), // Solo números
          phoneNumberPrefix: '+57',
          legalId: '123456789', // TODO: Agregar campo en el formulario
          legalIdType: 'CC'
        },
        shippingAddress: shippingAddress
      };

      console.log('✅ Configuración Wompi preparada con datos del backend:', wompiConfig);
      return wompiConfig;

    } catch (error) {
      console.error('❌ Error preparando datos de Wompi:', error);
      throw error;
    }
  }

  /**
   * Métodos específicos del carrito
   */
  updateParticipantQuantity(itemId: string, ageType: string, newQuantity: number): void {
    // TODO: Implementar actualización de cantidad
    console.log('Actualizando cantidad:', itemId, ageType, newQuantity);
  }

  removeItem(itemId: string): void {
    // TODO: Implementar método de remoción específico
    // Por ahora usamos clearCart como placeholder
    console.log('Removiendo item:', itemId);
    // this.cartService.clearCart();
  }

  proceedToCheckout(): void {
    console.log('CartSummary: Procediendo al checkout...');
    // TODO: Integrar con Wompi
    this.router.navigate(['/clients/payment']);
  }

  async proceedToPayment(): Promise<void> {
    console.log('CartSummary: Iniciando proceso de pago con Wompi...');
    
    // 🔍 Debug: revisar estado del formulario antes de sincronizar
    console.log('📋 Estado ANTES de sincronizar:');
    this.debugFormState();
    
    // 🔄 Sincronizar formularios
    this.syncFormsData();
    
    // 🔍 Debug: revisar estado después de sincronizar
    console.log('📋 Estado DESPUÉS de sincronizar:');
    this.debugFormState();
    
    // 1. Validar formulario
    if (!this.validateForm()) {
      console.error('Formulario inválido, no se puede proceder al pago');
      alert('Por favor complete todos los campos requeridos correctamente');
      return;
    }
    
    // 2. Validar que hay items en el carrito
    if (!this.hasItems) {
      console.error('No hay items en el carrito');
      alert('No hay items en el carrito para procesar');
      return;
    }
    
    this.processing = true;
    
    try {
      // 3. Preparar datos para Wompi usando endpoint del backend
      console.log('🔐 Generando datos de pago con backend...');
      const wompiConfig = await this.prepareWompiData();
      console.log('Configuración para Wompi:', wompiConfig);
      
      // 4. Validar configuración
      const validation = this.wompiService.validateConfig(wompiConfig);
      if (!validation.isValid) {
        console.error('Configuración inválida:', validation.errors);
        alert('Error en la configuración de pago: ' + validation.errors.join(', '));
        this.processing = false;
        return;
      }
      
      // 5. Procesar pago real con Wompi
      console.log('🚀 Ejecutando Widget de Wompi...');
      
      const result = await this.wompiService.processPayment(wompiConfig);
      
      // 6. Procesar resultado
      await this.handlePaymentResult(result);
      
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      
      let errorMessage = 'Error procesando el pago. Por favor intente nuevamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          errorMessage = 'El widget de pago tardó demasiado en cargar. Verifique su conexión a internet.';
        } else if (error.message.includes('script')) {
          errorMessage = 'Error cargando el sistema de pagos. Por favor recargue la página.';
        }
      }
      
      alert(errorMessage);
      this.processing = false;
    }
  }

  /**
   * Maneja el resultado del pago de Wompi
   */
  private async handlePaymentResult(result: WompiTransactionResult): Promise<void> {
    console.log('📋 Procesando resultado del pago:', result);
    
    const { transaction } = result;
    
    if (transaction.status === 'APPROVED') {
      console.log('✅ Pago aprobado:', transaction.id);
      
      try {
        // Crear reserva en el backend usando PaymentService
        const reservationData = await this.processPaymentWithBackend(transaction);
        
        console.log('📦 Datos de reserva a pasar al componente:', reservationData);
        console.log('🔍 Tipo de reservationData:', typeof reservationData);
        console.log('🔍 ¿Es null?', reservationData === null);
        console.log('🔍 ¿Es undefined?', reservationData === undefined);
        
        // Navegar a página de confirmación con datos de la reserva
        this.router.navigate(['/clients/tour-booking-confirmation'], {
          state: { reservationData }
        }).then(success => {
          console.log('✅ Navegación exitosa:', success);
          console.log('📍 State enviado:', { reservationData });
        }).catch(error => {
          console.error('❌ Error en navegación:', error);
        });
        
      } catch (error) {
        console.error('❌ Error creando reserva:', error);
        alert('El pago fue exitoso pero hubo un error creando la reserva. Por favor contacte soporte.');
        
        // Navegar a página de error o soporte
        this.router.navigate(['/clients/list-tours']);
      }
      
    } else if (transaction.status === 'DECLINED') {
      console.log('❌ Pago declinado:', transaction.id);
      alert('El pago fue declinado. Por favor intente con otro método de pago.');
      
    } else if (transaction.status === 'PENDING') {
      console.log('⏳ Pago pendiente:', transaction.id);
      alert('El pago está siendo procesado. Recibirá una confirmación pronto.');
      
      // TODO: Crear página para pagos pendientes
      this.router.navigate(['/clients/list-tours']);
    }
    
    this.processing = false;
  }

  /**
   * Procesar pago con backend usando PaymentService
   */
  private async processPaymentWithBackend(transaction: any): Promise<PaymentResponseDto> {
    try {
      console.log('📝 Procesando pago con backend...');
      
      // 1. Convertir transaction de Wompi al formato WompiResponseDto
      const wompiResponse: WompiResponseDto = {
        id: transaction.id,
        amount_in_cents: transaction.amount_in_cents,
        currency: transaction.currency,
        customer_email: transaction.customer_email || this.contactForm.email,
        payment_method_type: transaction.payment_method_type,
        status: transaction.status,
        created_at: transaction.created_at,
        finalized_at: transaction.finalized_at,
        payment_method: transaction.payment_method,
        // Incluir todos los datos adicionales de Wompi
        ...transaction
      };
      
      // 2. Obtener carrito actualizado del backend
      const shoppingCart = await this.paymentService.getUserShoppingCart();
      
      // 3. Filtrar solo items ACTIVE para el pago
      const activeItems = shoppingCart.items.filter(item => item.status === 'ACTIVE');
      
      if (activeItems.length === 0) {
        throw new Error('No hay items activos en el carrito para procesar');
      }
      
      // 4. Preparar información del pagador
      const payerInfo = {
        fullName: this.contactForm.firstName + ' ' + this.contactForm.lastName,
        firstName: this.contactForm.firstName,
        lastName: this.contactForm.lastName,
        email: this.contactForm.email,
        phone: this.contactForm.phone,
        documentType: 'CC', // TODO: Obtener del formulario si está disponible
        documentNumber: '00000000', // TODO: Obtener del formulario
        address1: this.contactForm.address1,
        city: this.contactForm.city,
        country: this.contactForm.country
      };
      
      // 5. Procesar pago con PaymentService
      const reservationData = await this.paymentService.processPayment(
        wompiResponse,
        activeItems,
        payerInfo
      );
      
      console.log('✅ Reserva creada exitosamente:', reservationData);
      return reservationData;
      
    } catch (error) {
      console.error('❌ Error procesando pago con backend:', error);
      throw error;
    }
  }

  /**
   * Crear reserva en el backend después del pago exitoso (LEGACY - mantener por compatibilidad)
   */
  private async createBooking(transaction: any): Promise<void> {
    try {
      console.log('📝 Creando reserva en el backend...');
      
      const bookingData = {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: this.wompiService.centsToCop(transaction.amount_in_cents),
        currency: transaction.currency,
        paymentMethod: transaction.payment_method_type,
        customer: this.userForm,
        cartItems: this.cartItems,
        cartSummary: this.cartSummary
      };
      
      // TODO: Implementar llamada real al backend
      console.log('Datos para crear reserva:', bookingData);
      
      // Por ahora solo simulamos
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Reserva creada exitosamente');
      
    } catch (error) {
      console.error('❌ Error creando reserva:', error);
      // No detener el flujo, el pago ya fue procesado
    }
  }

  continueShopping(): void {
    this.router.navigate([routes.tourList]);
  }

  /**
   * Helpers para el template
   */
  get hasItems(): boolean {
    return this.cartSummary !== null && this.cartSummary.totalItems > 0;
  }

  get totalAmount(): number {
    return this.cartSummary?.totalPrice || 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Elimina un tour específico del carrito
   */
  removeCartItem(itemId: string): void {
    console.log('Eliminando item del carrito via API:', itemId);
    
    // Mostrar loading para el item específico
    this.processing = true;
    
    // Encontrar el item a eliminar para mostrar información
    const itemToRemove = this.cartItems.find(item => item.id === itemId);
    const tourName = itemToRemove ? itemToRemove.tour.name : 'Tour';
    
    // Convertir string ID a number para la API (el backend usa IDs numéricos)
    const numericItemId = parseInt(itemId, 10);
    
    if (isNaN(numericItemId)) {
      console.error('ID de item inválido:', itemId);
      this.processing = false;
      alert('Error: ID de item inválido');
      return;
    }
    
    // Llamar a la API para eliminar el item del backend
    this.cartService.removeCartItemFromBackend(numericItemId)
      .then(() => {
        console.log('✅ Item eliminado exitosamente del backend');
        
        // IMPORTANTE: Forzar recarga desde backend para sincronizar
        console.log('🔄 Recargando carrito desde backend para sincronizar...');
        return this.cartService.reloadCartFromBackend();
      })
      .then(() => {
        // Update local cart items from service
        this.cartService.cartItems$.pipe(take(1)).subscribe(updatedItems => {
          this.cartItems = updatedItems;
          this.updateCartSummary();
          
          console.log(`✅ Tour "${tourName}" eliminado del carrito - UI actualizada`);
          
          // Si no quedan items, mostrar estado vacío
          if (this.cartItems.length === 0) {
            console.log('📭 Carrito vacío después de eliminación');
            this.handleEmptyCart();
          }
        });
        
        // Eliminar información del viajero asociado
        this.removeTravelerInfo(itemId);
      })
      .catch((error) => {
        console.error('❌ Error eliminando item del carrito:', error);
        
        // Mostrar mensaje de error al usuario
        let errorMessage = 'Error eliminando el tour. Por favor, intenta de nuevo.';
        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'El tour ya no está en tu carrito.';
          // IMPORTANTE: Forzar recarga para sincronizar con el backend
          console.log('⚠️ Tour no encontrado (404) - recargando para sincronizar...');
          this.cartService.reloadCartFromBackend()
            .then(() => {
              this.cartService.cartItems$.pipe(take(1)).subscribe(updatedItems => {
                this.cartItems = updatedItems;
                this.updateCartSummary();
                console.log('✅ Carrito sincronizado después de 404');
              });
            })
            .catch(reloadError => {
              console.error('❌ Error recargando carrito después de 404:', reloadError);
            });
        }
        
        alert(errorMessage); // TODO: Replace with proper toast/snackbar
      })
      .finally(() => {
        // Resetear loading
        this.processing = false;
      });
  }

  /**
   * Confirma la eliminación de un tour con dialog de confirmación
   */
  confirmRemoveItem(itemId: string, tourName: string): void {
    const confirmed = confirm(`¿Estás seguro de eliminar "${tourName}" del carrito?`);
    if (confirmed) {
      this.removeCartItem(itemId);
    }
  }

  /**
   * TrackBy function para mejor performance en ngFor
   */
  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  /**
   * Helper para obtener label de tipo de participante
   */
  getParticipantTypeLabel(ageType: string): string {
    const labels: { [key: string]: string } = {
      'ADULT': 'Adultos',
      'CHILD': 'Niños',
      'INFANT': 'Bebés',
      'SENIOR': 'Adultos Mayores'
    };
    return labels[ageType] || ageType;
  }

  /**
   * Inicializa la información de viajeros para cada tour en el carrito
   */
  private initializeTravelersInfo(): void {
    this.travelersInfo = [];
    
    this.cartItems.forEach(item => {
      const travelerExists = this.travelersInfo.find(t => t.tourId === item.id);
      
      if (!travelerExists) {
        this.travelersInfo.push({
          tourId: item.id,
          tourName: item.tour.name,
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        });
      }
    });
    
    console.log('Información de viajeros inicializada:', this.travelersInfo);
  }

  /**
   * Elimina la información del viajero cuando se elimina un tour
   */
  private removeTravelerInfo(tourId: string): void {
    const index = this.travelersInfo.findIndex(t => t.tourId === tourId);
    if (index !== -1) {
      this.travelersInfo.splice(index, 1);
      console.log(`Información del viajero eliminada para tour: ${tourId}`);
    }
  }

  /**
   * Valida que todos los viajeros tengan información completa
   */
  private validateTravelersInfo(): boolean {
    for (let traveler of this.travelersInfo) {
      if (!traveler.firstName || !traveler.lastName || !traveler.email || !traveler.phone) {
        console.error(`Información incompleta para el viajero del tour: ${traveler.tourName}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Obtiene la información del viajero para un tour específico
   */
  getTravelerForTour(tourId: string): TravelerInfo | undefined {
    return this.travelersInfo.find(t => t.tourId === tourId);
  }

  /**
   * Cuenta cuántos viajeros tienen información completa
   */
  getCompletedTravelersCount(): number {
    return this.travelersInfo.filter(traveler => 
      traveler.firstName && traveler.lastName && traveler.email && traveler.phone
    ).length;
  }

  /**
   * Calcula el porcentaje de completitud de viajeros
   */
  getTravelersCompletionPercentage(): number {
    if (this.travelersInfo.length === 0) return 0;
    return (this.getCompletedTravelersCount() / this.travelersInfo.length) * 100;
  }

  /**
   * Expande todos los accordions de viajeros
   */
  expandAllTravelers(): void {
    const accordionElements = document.querySelectorAll('.travelers-accordion .accordion-collapse');
    accordionElements.forEach((element, index) => {
      const bsCollapse = new (window as any).bootstrap.Collapse(element, {
        show: true
      });
    });
  }

  /**
   * Contrae todos los accordions de viajeros
   */
  collapseAllTravelers(): void {
    const accordionElements = document.querySelectorAll('.travelers-accordion .accordion-collapse.show');
    accordionElements.forEach((element) => {
      const bsCollapse = (window as any).bootstrap.Collapse.getInstance(element);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    });
  }

  /**
   * Navega rápidamente a un viajero específico
   */
  scrollToTraveler(index: number): void {
    const element = document.getElementById(`collapse${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Expandir el accordion si está cerrado
      if (!element.classList.contains('show')) {
        const button = document.querySelector(`[data-bs-target="#collapse${index}"]`) as HTMLElement;
        if (button) {
          button.click();
        }
      }
    }
  }

  /**
   * Verifica si el formulario de contacto está completo
   */
  isContactFormComplete(): boolean {
    return !!(
      this.contactForm.firstName && 
      this.contactForm.lastName && 
      this.contactForm.email && 
      this.contactForm.phone
    );
  }

  /**
   * Copia los datos del formulario de contacto a TODOS los viajeros
   */
  copyContactInfoToAllTravelers(): void {
    if (!this.isContactFormComplete()) {
      alert('Por favor completa primero la información de contacto (Nombre, Apellido, Email y Teléfono)');
      return;
    }

    // Confirmar acción
    const confirmed = confirm(
      `¿Estás seguro de copiar tus datos a todos los ${this.travelersInfo.length} viajeros?\n\n` +
      `Nombre: ${this.contactForm.firstName} ${this.contactForm.lastName}\n` +
      `Email: ${this.contactForm.email}\n` +
      `Teléfono: ${this.contactForm.phone}`
    );

    if (!confirmed) {
      return;
    }

    // Copiar datos a todos los viajeros
    this.travelersInfo.forEach((traveler, index) => {
      traveler.firstName = this.contactForm.firstName;
      traveler.lastName = this.contactForm.lastName;
      traveler.email = this.contactForm.email;
      traveler.phone = this.contactForm.phone;
    });

    console.log('✅ Datos de contacto copiados a todos los viajeros');
    
    // Mostrar notificación de éxito
    // TODO: Reemplazar con toast/snackbar
    alert(`✅ Tus datos fueron copiados exitosamente a los ${this.travelersInfo.length} viajeros`);
  }

  /**
   * Copia los datos del formulario de contacto a UN viajero específico
   */
  copyContactInfoToTraveler(index: number): void {
    if (!this.isContactFormComplete()) {
      alert('Por favor completa primero la información de contacto (Nombre, Apellido, Email y Teléfono)');
      return;
    }

    if (index < 0 || index >= this.travelersInfo.length) {
      console.error('Índice de viajero inválido:', index);
      return;
    }

    const traveler = this.travelersInfo[index];

    // Copiar datos
    traveler.firstName = this.contactForm.firstName;
    traveler.lastName = this.contactForm.lastName;
    traveler.email = this.contactForm.email;
    traveler.phone = this.contactForm.phone;

    console.log(`✅ Datos de contacto copiados al viajero del tour: ${traveler.tourName}`);
    
    // Mostrar notificación de éxito
    // TODO: Reemplazar con toast/snackbar
    alert(`✅ Tus datos fueron copiados exitosamente al viajero de "${traveler.tourName}"`);
  }

  /**
   * Actualiza el resumen del carrito basado en los items actuales
   */
  private updateCartSummary(): void {
    if (!this.cartSummary) {
      this.cartSummary = {
        totalItems: 0,
        totalDays: 0,
        totalParticipants: 0,
        totalPrice: 0,
        startDate: '',
        endDate: '',
        items: []
      };
    }

    this.cartSummary.totalItems = this.cartItems.length;
    this.cartSummary.totalParticipants = this.cartItems.reduce((sum, item) => sum + item.totalParticipants, 0);
    this.cartSummary.totalPrice = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    this.cartSummary.items = this.cartItems;

    // Calculate total days and date range
    if (this.cartItems.length > 0) {
      const dates = this.cartItems.map(item => new Date(item.dayDate));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      this.cartSummary.startDate = minDate.toISOString().split('T')[0];
      this.cartSummary.endDate = maxDate.toISOString().split('T')[0];
      
      // Calculate unique days
      const uniqueDays = new Set(this.cartItems.map(item => item.dayDate));
      this.cartSummary.totalDays = uniqueDays.size;
    }
  }

  /**
   * Maneja el estado cuando el carrito está vacío
   */
  private handleEmptyCart(): void {
    console.log('Carrito vacío - mostrando estado vacío');
    
    this.cartSummary = {
      totalItems: 0,
      totalDays: 0,
      totalParticipants: 0,
      totalPrice: 0,
      startDate: '',
      endDate: '',
      items: []
    };
    
    // Clear traveler information
    this.travelersInfo = [];
    
    // Optional: redirect to tours list after a delay
    // setTimeout(() => {
    //   this.router.navigate(['/clients/list-tours']);
    // }, 2000);
  }
}