import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject, takeUntil } from "rxjs";
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
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

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
}
