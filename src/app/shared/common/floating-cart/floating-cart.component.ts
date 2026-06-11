import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject, takeUntil, take, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { CartService } from "../../services/cart.service";
import { DaySelection, CartSummary, CartItem } from "../../dto/cart.dto";
import Swal from 'sweetalert2';
import { I18nFieldService } from "../../services/i18n-field.service";
import { TranslateService } from "@ngx-translate/core";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-floating-cart",
  standalone: false,
  templateUrl: "./floating-cart.component.html",
  styleUrls: ["./floating-cart.component.scss"],
})
export class FloatingCartComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Output() daySelected = new EventEmitter<string>();
  @Output() cartToggled = new EventEmitter<boolean>();
  @Output() clearCart = new EventEmitter<void>();

  daySelections: DaySelection[] = [];
  cartSummary: CartSummary | null = null;
  isExpanded: boolean = false;
  processing: boolean = false; // Estado para loading del API
  isClearing: boolean = false; // Estado para loading del clear
  private destroy$ = new Subject<void>();

  cartItems$!: Observable<CartItem[]>;

  constructor(
    private cartService: CartService,
    private router: Router,
    public i18nService: I18nFieldService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  get currentLocale(): string {
    const lang = this.translate.currentLang || 'es';
    if (lang.startsWith('en')) return 'en-US';
    if (lang.startsWith('pt')) return 'pt';
    return 'es';
  }

  ngOnInit(): void {
    console.log(
      "FloatingCart: Inicializando componente. isVisible:",
      this.isVisible
    );
    this.subscribeToCartData();
    
    this.cartItems$ = this.cartService.cartItems$.pipe(
      map(items => {
        // Ordenar por fecha (startDate o dayDate)
        return [...items].sort((a, b) => {
          const itemA = a as any;
          const itemB = b as any;
          const dateA = new Date(itemA.startDate || a.dayDate).getTime();
          const dateB = new Date(itemB.startDate || b.dayDate).getTime();
          return dateA - dateB; // Orden ascendente (más antigua primero)
        });
      })
    );
    
    // Forzar actualización cuando cambia el idioma
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToCartData(): void {
    // Suscribirse a las selecciones de días
    this.cartService.daySelections$
      .pipe(takeUntil(this.destroy$))
      .subscribe((days) => {
        console.log("FloatingCart: Días actualizados:", days);
        this.daySelections = days;
      });

    // Suscribirse al resumen del carrito
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary) => {
        console.log("FloatingCart: Resumen actualizado:", summary);
        this.cartSummary = summary;
      });
  }

  /**
   * Maneja el clic en un día
   */
  onDayClick(day: DaySelection): void {
    if (day.availableTours > 0) {
      this.daySelected.emit(day.date);
    }
  }

  /**
   * Remueve un tour de un día específico
   */
  removeTourFromDay(day: DaySelection, event: Event): void {
    event.stopPropagation();
    this.cartService.removeItemFromCart(day.date);
  }

  /**
   * Remueve un item del carrito directamente
   */
  async removeCartItem(item: any, event: Event): Promise<void> {
    event.stopPropagation();
    
    // Guardar el ID antes de eliminar para evitar problemas
    const itemId = item.id;
    const itemDate = item.dayDate;
    
    if (!itemId && !itemDate) {
      console.warn('Item sin ID ni fecha, no se puede eliminar');
      return;
    }
    
    try {
      // Si tiene ID numérico, eliminar del backend
      if (itemId) {
        const numericId = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
        if (!isNaN(numericId)) {
          console.log('🗑️ Eliminando item del backend:', numericId);
          await this.cartService.removeCartItemFromBackend(numericId);
        } else {
          // ID no numérico, eliminar localmente por fecha
          console.log('🗑️ Eliminando item local por fecha:', itemDate);
          this.cartService.removeItemFromCart(itemDate);
        }
      } else {
        // Sin ID, eliminar por fecha
        console.log('🗑️ Eliminando item por fecha:', itemDate);
        this.cartService.removeItemFromCart(itemDate);
      }
      
      console.log('✅ Tour eliminado del carrito');
      
      // Toast de éxito
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: this.translate.instant('cart.tourRemoved')
      });
      
    } catch (error: any) {
      console.error('❌ Error eliminando tour:', error);
      
      // Si es 404, el item ya no existe - actualizar UI igualmente
      if (error.status === 404) {
        console.log('Item ya no existe en backend, actualizando UI...');
        await this.cartService.reloadCartFromBackend();
        return;
      }
      
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('cart.errorTitle'),
        text: this.translate.instant('cart.removeTourError'),
        confirmButtonColor: '#0d6efd'
      });
    }
  }

  /**
   * Obtiene la imagen del tour
   */
  getTourImage(item: any): string {
    // Prioridad: gallery > tour.images > tourImageUrl > default
    
    // 1. Gallery del item (array de objetos con imageUrl)
    if (item.gallery && item.gallery.length > 0) {
      const firstImage = item.gallery[0];
      const url = firstImage.imageUrl || firstImage.url;
      if (url && !url.includes('default-tour')) {
        return url;
      }
    }
    
    // 2. tourImageUrl directo del item (viene del mapeo de API)
    if (item.tourImageUrl) {
      return item.tourImageUrl;
    }
    
    // 3. Verificar si el tour tiene imágenes directamente
    if (item.tour?.images && item.tour.images.length > 0) {
      return item.tour.images[0];
    }
    
    // 4. Gallery dentro del tour
    if (item.tour?.gallery && item.tour.gallery.length > 0) {
      const url = item.tour.gallery[0].imageUrl || item.tour.gallery[0].url;
      if (url) return url;
    }
    
    // 5. ImageUrl directo del tour
    if (item.tour?.imageUrl) {
      return item.tour.imageUrl;
    }
    
    // 6. Default (Use tours-01.jpg as default-tour.jpg is missing)
    return 'assets/img/tours/tours-01.jpg';
  }

  /**
   * Obtiene el rango de fechas del tour
   * Si tiene startDate y endDate diferentes, muestra rango
   * Si no, muestra solo la fecha única
   */
  getDateRange(item: any): string {
    const startDate = item.startDate || item.dayDate;
    const endDate = item.endDate;
    
    // Get current language from TranslateService and map it to a valid locale string
    let currentLang = this.translate.currentLang || 'es';
    let locale = this.currentLocale;
    
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr + 'T12:00:00');
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long',
        year: 'numeric'
      };
      return date.toLocaleDateString(locale, options);
    };

    const formatShortDate = (dateStr: string): string => {
      const date = new Date(dateStr + 'T12:00:00');
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short'
      };
      return date.toLocaleDateString(locale, options);
    };

    // Si tiene fecha de fin y es diferente a la de inicio
    if (endDate && endDate !== startDate) {
      const start = formatShortDate(startDate);
      const end = formatShortDate(endDate);
      const toWord = currentLang.startsWith('en') ? 'to' : (currentLang.startsWith('pt') ? 'a' : 'al');
      return `${start} ${toWord} ${end}`;
    }
    
    // Solo una fecha
    return formatDate(startDate);
  }

  /**
   * Expande o colapsa el carrito
   */
  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Cierra el carrito
   */
  closeCart(): void {
    this.isExpanded = false;
    this.cartToggled.emit(false);
  }

  /**
   * Abre el carrito expandido
   */
  openCart(): void {
    this.isExpanded = true;
    this.cartToggled.emit(true);
  }

  /**
   * Limpia todo el carrito con confirmación
   */
  async onClearCart(): Promise<void> {
    // Mostrar confirmación
    const result = await Swal.fire({
      title: this.translate.instant('cart.confirmClearTitle'),
      text: this.translate.instant('cart.confirmClearText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: this.translate.instant('cart.confirmClearYes'),
      cancelButtonText: this.translate.instant('cart.confirmClearCancel')
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      this.isClearing = true;
      await this.cartService.clearCart();
      
      // Mostrar mensaje de éxito
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: this.translate.instant('cart.clearSuccessTitle'),
        text: this.translate.instant('cart.clearSuccessText')
      });

      this.clearCart.emit();
    } catch (error) {
      console.error('Error al limpiar el carrito:', error);
      
      // Mostrar mensaje de error
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('cart.clearErrorTitle'),
        text: this.translate.instant('cart.clearErrorText'),
        confirmButtonColor: '#0d6efd'
      });
    } finally {
      this.isClearing = false;
    }
  }

  /**
   * Obtiene la clase CSS para un día
   */
  getDayClass(day: DaySelection): string {
    let classes = "day-item";

    if (day.isSelected) {
      classes += " selected";
    }

    if (day.availableTours === 0) {
      classes += " no-tours";
    }

    return classes;
  }

  /**
   * Verifica si hay días disponibles
   */
  hasDaysAvailable(): boolean {
    return this.daySelections.length > 0;
  }

  /**
   * Verifica si hay tours seleccionados
   */
  hasToursSelected(): boolean {
    return this.cartSummary !== null && this.cartSummary.totalItems > 0;
  }

  /**
   * Obtiene el porcentaje de días completados
   */
  getCompletionPercentage(): number {
    if (this.daySelections.length === 0) return 0;

    const selectedDays = this.daySelections.filter(
      (day) => day.isSelected
    ).length;
    return Math.round((selectedDays / this.daySelections.length) * 100);
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Carga el carrito desde la API y navega al resumen completo
   */
  onContinue(): void {
    console.log('FloatingCart: Usuario hizo clic en Continuar - cargando carrito desde backend...');
    this.processing = true;
    
    // Primero verificar items locales para logging
    this.cartService.cartItems$.pipe(take(1)).subscribe(localItems => {
      console.log('Items en carrito local antes de cargar backend:', localItems.length);
    });
    
    this.cartService.loadCartFromBackend()
      .then(() => {
        // Get current cart items from observable
        this.cartService.cartItems$.pipe(take(1)).subscribe(cartItems => {
          console.log('Carrito cargado desde backend API:', cartItems.length, 'items');
          
          if (cartItems.length > 0) {
            console.log('Carrito backend tiene items - navegando a cart-summary con', cartItems.length, 'tours...');
            this.router.navigate(['/clients/cart-summary']);
          } else {
            console.log('Carrito backend está vacío - verificando items locales...');
            this.handleEmptyCart();
          }
        });
      })
      .catch(error => {
        console.error('Error cargando carrito desde backend API:', error);
        this.handleCartError(error);
      })
      .finally(() => {
        this.processing = false;
      });
  }

  /**
   * Maneja el caso cuando el carrito está vacío en backend
   */
  private handleEmptyCart(): void {
    console.log('Carrito vacío en backend detectado');
    
    // Verificar si hay items en el carrito local (agregados desde el modal)
    this.cartService.cartItems$.pipe(take(1)).subscribe(async (localCartItems) => {
      if (localCartItems.length > 0) {
        console.log(`Encontrados ${localCartItems.length} items en carrito local`);
        console.log('Sincronizando carrito local con backend...');
        
        try {
          this.processing = true;
          
          // Usar el método del CartService para sincronizar
          await this.cartService.syncLocalCartWithBackend();
          
          console.log('Carrito sincronizado exitosamente, navegando a cart-summary...');
          this.router.navigate(['/clients/cart-summary']);
          
        } catch (error) {
          console.error('Error sincronizando carrito:', error);
          this.handleCartError(error);
        } finally {
          this.processing = false;
        }
      } else {
        console.log('No hay items locales - redirigiendo a tours para agregar items');
        this.router.navigate(['/clients/list-tours']);
      }
    });
  }

  /**
   * Maneja errores al cargar el carrito
   */
  private handleCartError(error: any): void {
    console.error('Error en carrito:', error);
    
    // Determinar tipo de error y mostrar mensaje apropiado
    let errorMessage = this.translate.instant('cart.errorLoading');
    
    if (error.status === 401) {
      errorMessage = this.translate.instant('cart.errorSessionExpired');
      // TODO: Redirigir al login
      // this.router.navigate(['/auth/login']);
    } else if (error.status === 0) {
      errorMessage = this.translate.instant('cart.errorConnection');
    } else if (error.status === 400) {
      errorMessage = this.translate.instant('cart.errorData');
    } else if (error.status === 500) {
      errorMessage = this.translate.instant('cart.errorServer');
    }
    
    // Mostrar mensaje de error al usuario
    alert(errorMessage); // TODO: Replace with proper toast/snackbar
    
    // En caso de error de sincronización, mantener los datos locales
    console.log('Manteniendo datos locales del carrito tras error de sincronización');
  }
}

