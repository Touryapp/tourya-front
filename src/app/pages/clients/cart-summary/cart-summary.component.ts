import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { routes } from '../../../shared/routes/routes';
import { CartService } from '../../../shared/services/cart.service';
import { CartItem, CartSummary } from '../../../shared/dto/cart.dto';
import { WompiService, WompiCheckoutConfig, WompiTransactionResult } from '../../../shared/services/wompi.service';
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

  // Mock data for testing UI
  private mockCartItems: CartItem[] = [
    {
      id: 'cart-item-1',
      dayDate: '2025-10-15',
      tour: {
        id: 1,
        name: 'City Tour por Cartagena Histórica',
        description: 'Descubre la magia de la ciudad amurallada con un recorrido completo por los sitios más emblemáticos de Cartagena.',
        duration: '4 horas',
        rating: 4.8
      },
      schedule: {
        id: 101,
        scheduleDate: '2025-10-15',
        startTime: '09:00',
        endTime: '13:00'
      },
      selectedSlot: {
        slotId: 201,
        startTime: '09:00',
        endTime: '13:00',
        minCapacity: 4,
        maxCapacity: 20
      },
      participants: [
        {
          ageType: 'ADULT',
          quantity: 2,
          price: 85000
        },
        {
          ageType: 'CHILD',
          quantity: 1,
          price: 45000
        }
      ],
      totalPrice: 215000,
      totalParticipants: 3,
      address: {
        city: 'Cartagena',
        state: 'Bolívar',
        country: 'Colombia',
        address: 'Centro Histórico, Plaza de los Coches'
      },
      gallery: [
        {
          imageUrl: 'assets/img/tours/cartagena-tour-1.jpg',
          description: 'Plaza de los Coches',
          order: 1
        },
        {
          imageUrl: 'assets/img/tours/cartagena-tour-2.jpg',
          description: 'Murallas de Cartagena',
          order: 2
        }
      ]
    },
    {
      id: 'cart-item-2',
      dayDate: '2025-10-16',
      tour: {
        id: 2,
        name: 'Islas del Rosario - Tour Completo',
        description: 'Excursión de día completo a las paradisíacas Islas del Rosario con snorkeling y almuerzo incluido.',
        duration: '8 horas',
        rating: 4.9
      },
      schedule: {
        id: 102,
        scheduleDate: '2025-10-16',
        startTime: '07:30',
        endTime: '17:30'
      },
      selectedSlot: {
        slotId: 202,
        startTime: '07:30',
        endTime: '17:30',
        minCapacity: 8,
        maxCapacity: 30
      },
      participants: [
        {
          ageType: 'ADULT',
          quantity: 2,
          price: 120000
        }
      ],
      totalPrice: 240000,
      totalParticipants: 2,
      address: {
        city: 'Cartagena',
        state: 'Bolívar',
        country: 'Colombia',
        address: 'Muelle La Bodeguita, Centro Histórico'
      },
      gallery: [
        {
          imageUrl: 'assets/img/tours/rosario-islands-1.jpg',
          description: 'Islas del Rosario',
          order: 1
        },
        {
          imageUrl: 'assets/img/tours/rosario-islands-2.jpg',
          description: 'Snorkeling en aguas cristalinas',
          order: 2
        }
      ]
    }
  ];

  private mockCartSummary: CartSummary = {
    totalItems: 2,
    totalDays: 2,
    totalParticipants: 5,
    totalPrice: 455000,
    startDate: '2025-10-15',
    endDate: '2025-10-16',
    items: [] // Will be populated with mockCartItems
  };

  constructor(
    private cartService: CartService,
    private router: Router,
    private wompiService: WompiService
  ) {
    // Initialize mock data
    this.mockCartSummary.items = this.mockCartItems;
  }

  ngOnInit(): void {
    console.log('CartSummary: Iniciando componente...');
    this.loadCartData();
    
    // Auto-load mock data after a short delay for demonstration
    setTimeout(() => {
      if ((!this.cartSummary || this.cartSummary.totalItems === 0) && this.cartItems.length === 0) {
        console.log('CartSummary: Auto-cargando mock data para demostración...');
        this.loadMockData();
      }
    }, 1000);
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
    
    // Suscribirse a cambios en el carrito
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary: CartSummary | null) => {
          // Si no hay datos reales, usar mock data para testing
          if (!summary || summary.totalItems === 0) {
            console.log('CartSummary: No hay datos reales, usando mock data para testing');
            this.cartSummary = this.mockCartSummary;
            this.cartItems = this.mockCartItems;
          } else {
            this.cartSummary = summary;
            console.log('CartSummary: Datos reales del carrito cargados:', summary);
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('CartSummary: Error cargando datos, usando mock data:', error);
          // En caso de error, usar mock data
          this.cartSummary = this.mockCartSummary;
          this.cartItems = this.mockCartItems;
          this.loading = false;
        }
      });

    // Obtener items del carrito
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: CartItem[]) => {
          if (items && items.length > 0) {
            this.cartItems = items;
            console.log('CartSummary: Items reales del carrito:', items);
          } else {
            // Si no hay items reales, usar mock data
            this.cartItems = this.mockCartItems;
            console.log('CartSummary: Usando mock items para testing');
          }
          // Inicializar información de viajeros
          this.initializeTravelersInfo();
        },
        error: (error: any) => {
          console.error('CartSummary: Error cargando items, usando mock data:', error);
          this.cartItems = this.mockCartItems;
        }
      });
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
    
    for (let field of requiredFields) {
      if (!this.userForm[field as keyof typeof this.userForm]) {
        console.error(`Campo requerido: ${field}`);
        // TODO: Mostrar mensaje de error específico
        return false;
      }
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userForm.email)) {
      console.error('Formato de email inválido');
      return false;
    }
    
    return true;
  }

  /**
   * Preparar datos para Wompi
   */
  private prepareWompiData(): WompiCheckoutConfig {
    const totalAmount = this.cartSummary?.totalPrice || 0;
    
    return {
      currency: 'COP',
      amountInCents: this.wompiService.copToCents(totalAmount),
      reference: this.wompiService.generateReference('TOURYA'),
      publicKey: environment.wompi.publicKey,
      redirectUrl: `${window.location.origin}/clients/payment-confirmation`,
      customerData: {
        email: this.userForm.email,
        fullName: `${this.userForm.firstName} ${this.userForm.lastName}`.trim(),
        phoneNumber: this.userForm.phone.replace(/\D/g, ''), // Solo números
        phoneNumberPrefix: '+57',
        legalId: '123456789', // TODO: Agregar campo en el formulario
        legalIdType: 'CC'
      },
      shippingAddress: {
        addressLine1: this.userForm.address1 || 'N/A',
        city: this.userForm.city || 'Bogotá',
        phoneNumber: this.userForm.phone.replace(/\D/g, ''),
        region: this.userForm.state || 'Cundinamarca',
        country: this.userForm.country || 'CO'
      }
    };
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
      // 3. Preparar datos para Wompi
      const wompiConfig = this.prepareWompiData();
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
      
      // TODO: Enviar datos al backend para crear la reserva
      await this.createBooking(transaction);
      
      // Navegar a página de confirmación
      this.router.navigate(['/clients/payment-confirmation'], {
        queryParams: {
          transactionId: transaction.id,
          reference: transaction.reference,
          status: transaction.status
        }
      });
      
    } else if (transaction.status === 'DECLINED') {
      console.log('❌ Pago declinado:', transaction.id);
      alert('El pago fue declinado. Por favor intente con otro método de pago.');
      
    } else if (transaction.status === 'PENDING') {
      console.log('⏳ Pago pendiente:', transaction.id);
      alert('El pago está siendo procesado. Recibirá una confirmación pronto.');
      
      // Navegar a página de estado pendiente
      this.router.navigate(['/clients/payment-pending'], {
        queryParams: {
          transactionId: transaction.id,
          reference: transaction.reference
        }
      });
    }
    
    this.processing = false;
  }

  /**
   * Crear reserva en el backend después del pago exitoso
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
   * Método para cargar mock data manualmente (útil para testing)
   */
  loadMockData(): void {
    console.log('CartSummary: Cargando mock data manualmente');
    this.loading = true;
    
    // Simular carga con delay
    setTimeout(() => {
      this.cartSummary = this.mockCartSummary;
      this.cartItems = this.mockCartItems;
      this.initializeTravelersInfo();
      this.loading = false;
      console.log('CartSummary: Mock data cargada:', this.cartSummary);
    }, 500);
  }

  /**
   * Método para limpiar datos (simular carrito vacío)
   */
  clearMockData(): void {
    console.log('CartSummary: Limpiando datos (simular carrito vacío)');
    this.cartSummary = {
      totalItems: 0,
      totalDays: 0,
      totalParticipants: 0,
      totalPrice: 0,
      startDate: '',
      endDate: '',
      items: []
    };
    this.cartItems = [];
  }

  /**
   * Elimina un tour específico del carrito
   */
  removeCartItem(itemId: string): void {
    console.log('Eliminando item del carrito:', itemId);
    
    // Mostrar loading para el item específico
    this.processing = true;
    
    // Encontrar el índice del item a eliminar
    const itemIndex = this.cartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const removedItem = this.cartItems[itemIndex];
      
      // Remover del array local
      this.cartItems.splice(itemIndex, 1);
      
      // Actualizar cartSummary
      if (this.cartSummary) {
        this.cartSummary.totalItems = this.cartItems.length;
        this.cartSummary.totalParticipants = this.cartItems.reduce((sum, item) => sum + item.totalParticipants, 0);
        this.cartSummary.totalPrice = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
        this.cartSummary.items = this.cartItems;
      }
      
      // Eliminar información del viajero asociado
      this.removeTravelerInfo(itemId);
      
      // Llamar al servicio para eliminar el item (cuando esté disponible)
      // this.cartService.removeItem(itemId);
      
      console.log(`Tour "${removedItem.tour.name}" eliminado del carrito`);
    }
    
    // Resetear loading
    this.processing = false;
    
    // Si no quedan items, mostrar estado vacío
    if (this.cartItems.length === 0) {
      console.log('Carrito vacío');
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
}