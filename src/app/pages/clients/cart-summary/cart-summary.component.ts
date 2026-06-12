import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, take, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { routes } from '../../../shared/routes/routes';
import { CartService } from '../../../shared/services/cart.service';
import { CartItem, CartSummary } from '../../../shared/dto/cart.dto';
import { WompiService, WompiCheckoutConfig, WompiTransactionResult } from '../../../shared/services/wompi.service';
import { PaymentService } from '../../../shared/services/payment.service';
import { PaymentResponseDto, WompiResponseDto, ShoppingCartResponseDto } from '../../../shared/dto/payment.dto';
import { environment } from '../../../../environments/environment';
import { I18nFieldService } from '../../../shared/services/i18n-field.service';
import { CreditService } from '../../../shared/services/credit.service';
import { ClientCredit } from '../../../shared/models/credit.model';
import { SearchToursService } from '../list-tours/search-tours.service';
import { TouristService } from '../../../shared/services/tourist.service';
import { CountryService } from '../../../shared/services/country.service';
import { DepartmentService } from '../../../shared/services/department.service';
import { CityService } from '../../../shared/services/city.service';
import { Country } from '../../../shared/dto/country.dto';
import { Department } from '../../../shared/dto/department.dto';
import { City } from '../../../shared/dto/city.dto';

declare var google: any;

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
export class CartSummaryComponent implements OnInit, OnDestroy, AfterViewInit {
  public routes = routes;
  
  @ViewChild('addressInput') addressInput!: ElementRef;
  
  // Cart data properties
  cartSummary: CartSummary | null = null;
  cartItems: CartItem[] = [];
  userCredits: ClientCredit[] = [];
  selectedCredits: ClientCredit[] = [];
  appliedCreditsValue = 0;
  isModalOpen: boolean = false;
  totalCreditsValue = 0;
  loading = false;
  processing = false;

  // Reservation state
  private reservationIds: number[] = []; // ✨ Almacena los IDs devueltos por la pre-reserva

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
    zipCode: ''
  };

  // Hospedaje form
  accommodationForm = {
    name: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null
  };

  // Electronic Billing form
  billingForm = {
    required: false,
    documentType: 'CC',
    documentNumber: '',
    customerName: '',
    email: '',
    phone: ''
  };

  // Traveler information per tour
  travelersInfo: TravelerInfo[] = [];

  // Locations state
  countries: Country[] = [];
  departments: Department[] = [];
  cities: City[] = [];

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

  get currentLang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'es';
  }

  constructor(
    private cartService: CartService,
    private router: Router,
    private wompiService: WompiService,
    private paymentService: PaymentService,
    public i18nService: I18nFieldService,
    private creditService: CreditService,
    private searchToursService: SearchToursService,
    private touristService: TouristService,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    console.log('CartSummary: Iniciando componente...');
    this.loadCartData();
    this.loadUserCredits();
    this.loadUserProfile();
    this.getCountries();
  }

  getCountries() {
    this.countryService.getCountries().subscribe({
      next: (data) => {
        if (data) {
          this.countries = data;
        } else {
          this.countries = [];
        }
      },
      error: (err) => {
        console.error("Error getting countries.", err);
        this.countries = [];
      },
    });
  }

  onCountryChange(event: any) {
    const value = event.target.value;
    this.departments = [];
    this.cities = [];
    this.contactForm.state = '';
    this.contactForm.city = '';
    if (value) {
      this.getDepartments(+value);
    }
  }

  getDepartments(countryId: number) {
    this.departmentService.getDepartmentsByCountryId(countryId).subscribe({
      next: (data) => {
        if (data) {
          this.departments = data;
        } else {
          this.departments = [];
        }
      },
      error: (err) => {
        console.error("Error getting departments.", err);
        this.departments = [];
      },
    });
  }

  onDepartmentChange(event: any) {
    const value = event.target.value;
    this.cities = [];
    this.contactForm.city = '';
    if (value) {
      this.getCities(+value);
    }
  }

  getCities(departmentId: number) {
    this.cityService.getCitiesByDepartmentId(departmentId).subscribe({
      next: (data) => {
        if (data) {
          this.cities = data;
        } else {
          this.cities = [];
        }
      },
      error: (err) => {
        console.error("Error getting cities.", err);
        this.cities = [];
      },
    });
  }

  ngAfterViewInit(): void {
    // Inicializar Google Maps Autocomplete si está disponible después del render
    setTimeout(() => {
      this.initAutocomplete();
    }, 500);
  }

  initAutocomplete(): void {
    if (this.addressInput && this.addressInput.nativeElement && typeof google !== 'undefined' && google.maps && google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
        types: ['address'],
        componentRestrictions: { country: ['COL'] } // As in add-tour
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          this.accommodationForm.latitude = place.geometry.location.lat();
          this.accommodationForm.longitude = place.geometry.location.lng();
          this.accommodationForm.address = this.addressInput.nativeElement.value;
        } else {
          this.accommodationForm.latitude = null;
          this.accommodationForm.longitude = null;
          console.warn("No geometry for selected place:", place);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del perfil del usuario y pre-llena el formulario
   */
  private loadUserProfile(): void {
    this.touristService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          if (profile) {
            console.log('CartSummary: Perfil de usuario cargado:', profile);
            this.contactForm.firstName = profile.firstName || this.contactForm.firstName;
            this.contactForm.lastName = profile.lastName || this.contactForm.lastName;
            this.contactForm.email = profile.email || this.contactForm.email;
            this.contactForm.phone = profile.phone || this.contactForm.phone;
            this.contactForm.country = this.mapCountryToIsoCode(profile.country) || this.contactForm.country;
            this.contactForm.city = profile.city || this.contactForm.city;
            
            // Asignar campos adicionales si el backend los envía (dirección, info adicional)
            if ((profile as any).address) {
              this.contactForm.address1 = (profile as any).address || this.contactForm.address1;
            }


            this.syncFormsData();
          }
        },
        error: (error) => {
          console.error('CartSummary: Error cargando perfil de usuario:', error);
        }
      });
  }

  /**
   * Mapea el nombre del país al código ISO requerido por el select y Wompi
   */
  private mapCountryToIsoCode(countryName: string): string {
    if (!countryName) return '';
    const name = countryName.toLowerCase().trim();
    if (name === 'colombia' || name === 'co') return 'CO';
    if (name === 'estados unidos' || name === 'united states' || name === 'usa' || name === 'us') return 'US';
    if (name === 'españa' || name === 'spain' || name === 'es') return 'ES';
    // Si ya es código de 2 letras o es otro país, devolverlo (aunque el form sólo tenga 3 opciones)
    return countryName.length === 2 ? countryName.toUpperCase() : countryName;
  }

  /**
   * Carga los datos del carrito desde el servicio
   */
  private loadCartData(): void {
    this.loading = true;
    
    // Subscribe to cart items from service
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: CartItem[]) => {
          this.cartItems = items;
          this.updateCartSummary();
          
          if (items && items.length > 0) {
            console.log('CartSummary: Items del carrito recibidos:', items.length);
            this.initializeTravelersInfo();
            this.enrichCartItemsWithImages();
          } else {
            console.log('CartSummary: Carrito vacío');
            this.handleEmptyCart();
          }
          
          this.loading = false;
        },
        error: (error: any) => {
          console.error('CartSummary: Error cargando items:', error);
          this.handleEmptyCart();
          this.loading = false;
        }
      });

    // Asegurar que el carrito se cargue desde el backend al inicio
    this.cartService.loadCartFromBackend().catch(err => {
      console.error('CartSummary: Error inicializando carga desde backend:', err);
    });
  }

  /**
   * Enriquecer los items del carrito con la imagen del tour si falta
   */
  private enrichCartItemsWithImages(): void {
    if (!this.cartItems || this.cartItems.length === 0) return;

    this.cartItems.forEach(item => {
      // Si el item tiene tourId pero no tiene galería o imagen
      const hasNoImage = !item.gallery || item.gallery.length === 0 || !item.gallery[0]?.imageUrl;
      
      if (item.tour?.id && hasNoImage) {
        console.log(`CartSummary: Cargando imagen para tour ${item.tour.id}...`);
        this.searchToursService.detailTourPublic(item.tour.id)
          .pipe(take(1))
          .subscribe({
            next: (details) => {
              if (details) {
                // Priorizar profilePicture si existe
                if (details.profilePicture && details.profilePicture.imageUrl) {
                  item.gallery = [{
                    imageUrl: details.profilePicture.imageUrl,
                    description: '',
                    order: 0
                  }];
                } else if (details.galleries && details.galleries.length > 0) {
                  // Fallback a la primera imagen de la galería
                  item.gallery = details.galleries.map(g => ({
                    imageUrl: g.imageUrl,
                    description: '',
                    order: g.orderIndex || 0
                  }));
                }
              }
            },
            error: (err) => console.error(`CartSummary: Error cargando imagen para tour ${item.tour.id}:`, err)
          });
      }
    });
  }

  /**
   * Carga los créditos disponibles del usuario
   */
  private loadUserCredits(): void {
    this.creditService.getCredits('CREATED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (credits: ClientCredit[]) => {
          this.userCredits = credits;
          this.totalCreditsValue = credits.reduce((acc, credit) => acc + credit.amount, 0);
          console.log('CartSummary: Créditos cargados:', this.userCredits.length, 'créditos');
        },
        error: (error: any) => {
          console.error('CartSummary: Error cargando créditos:', error);
        }
      });
  }

  /**
   * Maneja la selección de créditos desde el componente modal
   */
  onCreditsSelected(selected: ClientCredit[]): void {
    if (!selected || selected.length === 0) {
      this.removeAppliedCredits();
      this.closeCreditsModal();
      return;
    }

    if (!this.cartItems || this.cartItems.length === 0) {
      alert(this.translate.instant('cartSummary.errors.noCartItemsForCredits'));
      return;
    }

    this.processing = true;
    const amountToReserve = selected.reduce((acc, credit) => acc + credit.amount, 0);
    const creditIds = selected.map(c => c.id);
    const shoppingCartItemId = parseInt(this.cartItems[0].id, 10);

    const payload = {
      shoppingCartItemId,
      amountToReserve,
      creditIds
    };

    console.log('Reservando créditos:', payload);

    this.creditService.reserveCredits(payload).subscribe({
      next: (response) => {
        console.log('✅ Créditos reservados exitosamente en el backend:', response);
        this.selectedCredits = selected;
        this.appliedCreditsValue = amountToReserve;
        this.isModalOpen = false;
        this.closeCreditsModal();
        this.processing = false;
      },
      error: (error) => {
        console.error('❌ Error reservando créditos:', error);
        
        // Manejar mensaje de error del backend si existe
        let errorMessage = 'Error al aplicar los créditos. Por favor intente nuevamente.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }

        alert(errorMessage);
        this.processing = false;
      }
    });
  }

  onCreditsCanceled(): void {
    this.isModalOpen = false;
    this.closeCreditsModal();
  }

  private closeCreditsModal(): void {
    const modalElement = document.getElementById('creditsModal');
    if (modalElement) {
      const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  /**
   * Resetea los créditos seleccionados
   */
  removeAppliedCredits(): void {
    this.selectedCredits = [];
    this.appliedCreditsValue = 0;
  }

  /**
   * Calcula el total final a pagar restando créditos aplicados
   */
  get finalTotalToPay(): number {
    const total = this.cartSummary?.totalPrice || 0;
    return Math.max(0, total - this.appliedCreditsValue);
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
        alert(this.translate.instant('cartSummary.errors.completeField', { field }));
        return false;
      }
    }
    
    // Validar información de viajeros
    if (!this.validateTravelersInfo()) {
      alert(this.translate.instant('cartSummary.errors.completeTravelersInfo'));
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
      alert(this.translate.instant('cartSummary.errors.invalidEmail'));
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
      const totalAmount = this.finalTotalToPay;
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

      // ⚠️ IMPORTANTE: No incluir redirectUrl con localhost o IPs (causa error 403 en Wompi)
      // Wompi bloquea URLs con localhost/IPs por regla de seguridad EC2MetaDataSSRF_QUERYARGUMENTS
      
      // Verificar si el origin es un dominio real o una IP pública (no metadata AWS)
      const isRealDomain = () => {
        const origin = window.location.origin;
        // Permitir localhost en ambientes de desarrollo si es necesario, 
        // pero Wompi a veces lo bloquea. Permitimos IPs que no sean la de metadata.
        if (origin.includes('169.254.169.254')) {
          return false;
        }
        // Si es localhost o 127.0.0.1, Wompi Sandbox lo permite, el comentario anterior sugería lo contrario
        // pero para el usuario en test mode necesitamos que el redirectUrl se envíe.
        return true; 
      };

      // Obtener una URL de redirección segura que Wompi no bloquee (WAF bloquea IPs literales y patrones X.X.X.X)
      const getSafeRedirectUrl = () => {
        const origin = window.location.origin;
        // Detectar si el origin es una IP o localhost
        const isIpOrLocalhost = /^(https?:\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost)(:\d+)?$/.test(origin);
        
        if (isIpOrLocalhost) {
          // Es una IP o localhost, transformar a sslip.io con guiones para engañar al WAF de Wompi
          console.log('🔄 Transformando origen IP/localhost a sslip.io (con guiones) dinámicamente...');
          
          const urlObj = new URL(origin);
          let hostname = urlObj.hostname;
          
          if (hostname === 'localhost') {
            hostname = '127.0.0.1';
          }
          
          // Transformar 127.0.0.1 -> 127-0-0-1.sslip.io (Usa guiones para evitar el WAF)
          const safeHostname = hostname.replace(/\./g, '-') + '.sslip.io';
          const port = urlObj.port ? `:${urlObj.port}` : '';
          const protocol = urlObj.protocol;
          
          return `${protocol}//${safeHostname}${port}/clients/tour-booking-confirmation`;
        }
        
        // Si ya es un dominio real, usar origin normal
        return `${origin}/clients/tour-booking-confirmation`;
      };

      const wompiConfig: WompiCheckoutConfig = {
        currency: 'COP',
        amountInCents: amountInCents,
        reference: reference,  // ← Desde backend
        publicKey: environment.wompi.publicKey,
        // ✅ URL dinámica y segura que Wompi acepta (usando nip.io para IPs)
        redirectUrl: getSafeRedirectUrl(),
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
    
    // 🔍 Trigger search validation before proceeding
    const isValid = await this.triggerSearchValidation();
    if (!isValid) {
      this.processing = false;
      return;
    }

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
      alert(this.translate.instant('cartSummary.errors.completeRequiredFields'));
      return;
    }
    
    // 2. Validar que hay items en el carrito
    if (!this.hasItems) {
      console.error('No hay items en el carrito');
      alert(this.translate.instant('cartSummary.errors.noCartItems'));
      return;
    }

    this.processing = true;

    // 🚀 NUEVO PASO: Crear pre-reserva antes de Wompi
    try {
      console.log('📝 Creando pre-reserva en el backend...');
      const reservationPayload = {
        items: this.cartItems.map(item => {
          const traveler = this.travelersInfo.find(t => t.tourId === item.id);
          return {
            shoppingCartItemId: parseInt(item.id, 10),
            serviceResponsible: traveler && traveler.firstName ? {
              name: `${traveler.firstName} ${traveler.lastName}`,
              email: traveler.email,
              phone: traveler.phone
            } : {
              name: `${this.contactForm.firstName} ${this.contactForm.lastName}`,
              email: this.contactForm.email,
              phone: this.contactForm.phone
            }
          };
        }),
        holdItemsValid: true,
        originCountryId: this.contactForm.country ? +this.contactForm.country : null,
        originStateId: this.contactForm.state ? +this.contactForm.state : null,
        originCityId: this.contactForm.city ? +this.contactForm.city : null,
        accommodationName: this.accommodationForm.name || null,
        accommodationLatitude: this.accommodationForm.latitude || null,
        accommodationLongitude: this.accommodationForm.longitude || null,
        electronicBilling: this.billingForm.required,
        billingDocumentType: this.billingForm.required ? this.billingForm.documentType : null,
        billingDocumentNumber: this.billingForm.required ? this.billingForm.documentNumber : null,
        billingCustomerName: this.billingForm.required ? this.billingForm.customerName : null,
        billingEmail: this.billingForm.required ? this.billingForm.email : null,
        billingPhone: this.billingForm.required ? this.billingForm.phone : null
      };

      const response = await this.paymentService.createPreReservation(reservationPayload);
      if (response && response.reservationIds) {
        this.reservationIds = response.reservationIds;
      }
      console.log('✅ Pre-reserva exitosa, IDs:', this.reservationIds);
    } catch (error: any) {
      console.error('❌ Error en pre-reserva:', error);
      let errorMsg = 'No pudimos confirmar la reserva en este momento. Por favor, intenta de nuevo.';
      if (error.error && error.error.message) {
        errorMsg = error.error.message;
      } else if (error.error && error.error.error) {
        errorMsg = error.error.error;
      }
      alert(errorMsg);
      this.processing = false;
      return;
    }

    // ✨ Bypass scenario: User has applied credits that cover the ENTIRE cost
    if (this.finalTotalToPay === 0 && this.appliedCreditsValue > 0) {
      console.log('CartSummary: El pago está cubierto 100% por créditos. Omitiendo Wompi.');
      try {
        // Enviar pago "CREDIT" al backend
        const reservationData = await this.processPaymentWithBackend({
          id: '', // Empty Wompi ID since Wompi wasn't called
          amount_in_cents: 0,
          currency: 'COP',
          payment_method_type: 'CREDIT',
          status: 'APPROVED',
          created_at: new Date().toISOString()
        });

        // Navegar a confirmación
        this.router.navigate(['/clients/tour-booking-confirmation'], {
          state: { reservationData }
        }).then(success => {
          console.log('✅ Navegación exitosa (100% Crédito):', success);
        });

      } catch (error) {
        console.error('❌ Error procesando pago 100% crédito:', error);
        alert(this.translate.instant('cartSummary.errors.creditPaymentError'));
      } finally {
        this.processing = false;
      }
      return; // Exit method
    }
    
    try {
      // 3. Preparar datos para Wompi usando endpoint del backend
      console.log('🔐 Generando datos de pago con backend...');
      const wompiConfig = await this.prepareWompiData();
      console.log('Configuración para Wompi:', wompiConfig);
      
      // 4. Validar configuración
      const validation = this.wompiService.validateConfig(wompiConfig);
      if (!validation.isValid) {
        console.error('Configuración inválida:', validation.errors);
        alert(this.translate.instant('cartSummary.errors.paymentConfigError', { errors: validation.errors.join(', ') }));
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
        alert(this.translate.instant('cartSummary.errors.paymentSuccessButReservationFailed'));
        
        // Navegar a página de error o soporte
        this.router.navigate(['/clients/list-tours']);
      }
      
    } else if (transaction.status === 'DECLINED') {
      console.log('❌ Pago declinado:', transaction.id);
      alert(this.translate.instant('cartSummary.errors.paymentDeclined'));
      
    } else if (transaction.status === 'PENDING') {
      console.log('⏳ Pago pendiente:', transaction.id);
      alert(this.translate.instant('cartSummary.errors.paymentPending'));
      
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
        payerInfo,
        this.reservationIds, // ✨ IDs de las reservas obtenidas previamente
        {
          appliedCreditsValue: this.appliedCreditsValue,
          finalTotalToPay: this.finalTotalToPay,
          selectedCredits: this.selectedCredits.map(c => c.id)
        }
      );
      
      // Inject fallback values for frontend if backend doesn't return them yet
      if (reservationData) {
        if (reservationData.totalAmount === undefined) {
          reservationData.totalAmount = this.cartSummary?.totalPrice || 0;
        }
        if (reservationData.appliedCredits === undefined) {
          reservationData.appliedCredits = this.appliedCreditsValue;
        }
      }

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

  /**
   * Dispara el servicio de búsqueda y valida la capacidad antes de pagar
   */
  private async triggerSearchValidation(): Promise<boolean> {
    try {
      const traceStr = localStorage.getItem('userActionsTrace');
      if (!traceStr) return true;

      const trace = JSON.parse(traceStr);
      const tourId = trace.tourAddedInCart?.tourId;
      const startDate = trace.checkIn || trace.tourAddedInCart?.dayDate;
      const endDate = trace.checkOut || trace.tourAddedInCart?.dayDate;

      if (!tourId || !startDate || !endDate) return true;

      const searchPayload = {
        tourId: tourId,
        language: 'es',
        startDate: startDate,
        endDate: endDate
      };

      console.log('📊 CartSummary: Validando capacidad con servicio /search:', searchPayload);

      // Consumir el servicio y esperar respuesta
      const results = await firstValueFrom(this.searchToursService.searchTours(searchPayload, 1, 10));
      
      if (!results || !results.content || results.content.length === 0) {
        console.warn('CartSummary: No se encontraron resultados para validación');
        return true;
      }

      // Encontrar el tour en los resultados
      const tourResult = results.content.find(r => r.tour.id === tourId);
      if (!tourResult) return true;

      // Encontrar el item en el carrito que corresponde a este tour y fecha
      const cartItem = this.cartItems.find(item => 
        item.tour.id === tourId && 
        item.dayDate === (trace.tourAddedInCart?.dayDate || startDate)
      );
      if (!cartItem) return true;

      // Encontrar el schedule y slot específico
      const schedule = tourResult.schedules.find(s => s.scheduleDate === cartItem.dayDate);
      if (!schedule) return true;

      const slot = schedule.config?.slots.find(sl => sl.slotId === cartItem.selectedSlot.slotId);
      if (!slot) {
        console.warn('CartSummary: No se encontró el slot en los resultados de búsqueda');
        return true;
      }

      const priceType = tourResult.tour.priceType;
      const maxPeople = tourResult.tour.maxPeople || 0;
      const availability = slot.availability || 0;

      console.log(`🔍 Validando ${priceType}: disponiblidad=${availability}, maxPeople=${maxPeople}`);

      if (priceType === 'group') {
        const groupsRequested = cartItem.groupCount || 1;
        const totalCapacity = maxPeople * groupsRequested;

        // 1. Validar grupos disponibles
        if (groupsRequested > availability) {
          alert(`Lo sentimos, solo quedan ${availability} grupos disponibles para este horario.`);
          return false;
        }
        
        // 2. Validar participantes totales (capacidad escalada)
        if (cartItem.totalParticipants > totalCapacity) {
          alert(`Lo sentimos, el número de participantes (${cartItem.totalParticipants}) excede la capacidad total para ${groupsRequested} grupos (${totalCapacity} personas).`);
          return false;
        }

        // 3. Validar sillas vacías (al menos 1 persona por grupo)
        if (cartItem.totalParticipants < groupsRequested) {
          alert(`Estás seleccionando menos participantes (${cartItem.totalParticipants}) que la cantidad de grupos reservados (${groupsRequested}). Vas a tener sillas vacías.`);
          return false;
        }
      } else if (priceType === 'individual') {
        // 1. Validar participantes totales (individual)
        if (cartItem.totalParticipants > availability) {
          alert(`Lo sentimos, no hay suficiente cupo para la cantidad de participantes seleccionada. Disponibles: ${availability}`);
          return false;
        }
      }

      console.log('✅ CartSummary: Validación de capacidad exitosa');
      return true;

    } catch (error) {
      console.error('❌ CartSummary: Error en validación de capacidad', error);
      // En caso de error técnico en la validación, permitimos continuar para no bloquear al usuario
      return true;
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
      alert(this.translate.instant('cartSummary.errors.invalidItemId'));
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
    const keys: { [key: string]: string } = {
      'ADULT': 'tourSlotModal.adults',
      'CHILD': 'tourSlotModal.children',
      'INFANT': 'tourSlotModal.infants',
      'SENIOR': 'tourSlotModal.seniors'
    };
    return keys[ageType] || ageType;
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
      alert(this.translate.instant('cartSummary.errors.completeContactFirst'));
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
      alert(this.translate.instant('cartSummary.errors.completeContactFirst'));
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

  getTourImage(item: any): string {
    if (item.profilePicture?.imageUrl) {
      return item.profilePicture.imageUrl;
    }
    if (item.tourImageUrl) {
      return item.tourImageUrl;
    }
    if (item.displayImageUrl) {
      return item.displayImageUrl;
    }
    if (item.gallery && item.gallery.length > 0) {
      return item.gallery[0].imageUrl;
    }
    if (item.tour?.gallery && item.tour.gallery.length > 0) {
      return item.tour.gallery[0].imageUrl;
    }
    return 'assets/img/tours/tours-01.jpg';
  }
}