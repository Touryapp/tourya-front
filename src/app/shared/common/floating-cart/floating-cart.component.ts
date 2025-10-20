import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject, takeUntil, take } from "rxjs";
import { Router } from "@angular/router";
import { CartService } from "../../services/cart.service";
import { DaySelection, CartSummary } from "../../dto/cart.dto";

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
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  /**
   * Obtiene los items actuales del carrito
   */
  getCartItems() {
    return this.cartService.cartItems$;
  }

  ngOnInit(): void {
    console.log(
      "FloatingCart: Inicializando componente. isVisible:",
      this.isVisible
    );
    this.subscribeToCartData();
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
   * Limpia todo el carrito
   */
  onClearCart(): void {
    this.cartService.clearCart();
    this.clearCart.emit();
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
    const hasData = this.daySelections.length > 0;
    console.log(
      "FloatingCart: hasDaysAvailable ->",
      hasData,
      "Días:",
      this.daySelections.length
    );
    return hasData;
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
    let errorMessage = 'Error cargando el carrito. Por favor, intenta de nuevo.';
    
    if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      // TODO: Redirigir al login
      // this.router.navigate(['/auth/login']);
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.status === 400) {
      errorMessage = 'Error en los datos del carrito. Verifica la información e intenta de nuevo.';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
    }
    
    // Mostrar mensaje de error al usuario
    alert(errorMessage); // TODO: Replace with proper toast/snackbar
    
    // En caso de error de sincronización, mantener los datos locales
    console.log('Manteniendo datos locales del carrito tras error de sincronización');
  }
}
