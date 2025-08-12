import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, DaySelection, CartSummary, SlotWithPrices, ParticipantSelection } from '../dto/cart.dto';
import { SearchToursDto } from '../dto/search-tours.dto';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private daySelectionsSubject = new BehaviorSubject<DaySelection[]>([]);
  private cartSummarySubject = new BehaviorSubject<CartSummary | null>(null);

  public cartItems$ = this.cartItemsSubject.asObservable();
  public daySelections$ = this.daySelectionsSubject.asObservable();
  public cartSummary$ = this.cartSummarySubject.asObservable();

  private currentStartDate: string = '';
  private currentEndDate: string = '';

  constructor() {}

  /**
   * Inicializa el carrito con las fechas de búsqueda
   */
  initializeCart(startDate: string, endDate: string): void {
    this.currentStartDate = startDate;
    this.currentEndDate = endDate;
    
    const days = this.calculateDaysBetweenDates(startDate, endDate);
    this.daySelectionsSubject.next(days);
    this.updateCartSummary();
  }

  /**
   * Calcula los días entre dos fechas
   */
  private calculateDaysBetweenDates(startDate: string, endDate: string): DaySelection[] {
    const days: DaySelection[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (!startDate || !endDate || start >= end) {
      return days;
    }

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let current = new Date(start);
    let dayNumber = 1;

    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayName = dayNames[current.getDay()];
      
      days.push({
        date: dateStr,
        dayName: dayName,
        dayNumber: dayNumber,
        isSelected: false,
        availableTours: 0 // Se actualizará cuando se carguen los tours
      });

      current.setDate(current.getDate() + 1);
      dayNumber++;
    }

    return days;
  }

  /**
   * Actualiza la cantidad de tours disponibles para cada día
   */
  updateAvailableToursForDays(tours: SearchToursDto[]): void {
    const currentDays = this.daySelectionsSubject.getValue();
    console.log('CartService: Actualizando tours disponibles. Días actuales:', currentDays.length);
    
    const updatedDays = currentDays.map(day => {
      const toursForDay = tours.filter(tour => {
        const tourDate = new Date(tour.schedule.scheduleDate).toISOString().split('T')[0];
        return tourDate === day.date;
      });
      
      console.log(`CartService: Día ${day.date} - Tours disponibles: ${toursForDay.length}`);
      
      return {
        ...day,
        availableTours: toursForDay.length
      };
    });

    console.log('CartService: Emitiendo días actualizados:', updatedDays);
    this.daySelectionsSubject.next(updatedDays);
  }

  /**
   * Agrega un item al carrito
   */
  addItemToCart(cartItem: CartItem): void {
    console.log('CartService: Agregando item al carrito:', cartItem);
    const currentItems = this.cartItemsSubject.getValue();
    
    // Verificar si ya existe un tour para ese día
    const existingItemIndex = currentItems.findIndex(item => item.dayDate === cartItem.dayDate);
    
    if (existingItemIndex >= 0) {
      // Reemplazar el tour existente para ese día
      console.log('CartService: Reemplazando tour existente para el día:', cartItem.dayDate);
      currentItems[existingItemIndex] = cartItem;
    } else {
      // Agregar nuevo item
      console.log('CartService: Agregando nuevo tour para el día:', cartItem.dayDate);
      currentItems.push(cartItem);
    }

    this.cartItemsSubject.next([...currentItems]);
    this.updateDaySelection(cartItem.dayDate, cartItem);
    this.updateCartSummary();
    console.log('CartService: Item agregado. Total items en carrito:', currentItems.length);
  }

  /**
   * Remueve un item del carrito
   */
  removeItemFromCart(dayDate: string): void {
    const currentItems = this.cartItemsSubject.getValue();
    const filteredItems = currentItems.filter(item => item.dayDate !== dayDate);
    
    this.cartItemsSubject.next(filteredItems);
    this.updateDaySelection(dayDate, undefined);
    this.updateCartSummary();
  }

  /**
   * Actualiza la selección de un día específico
   */
  private updateDaySelection(dayDate: string, cartItem?: CartItem): void {
    const currentDays = this.daySelectionsSubject.getValue();
    const updatedDays = currentDays.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          isSelected: !!cartItem,
          tourSelected: cartItem
        };
      }
      return day;
    });

    this.daySelectionsSubject.next(updatedDays);
  }

  /**
   * Actualiza el resumen del carrito
   */
  private updateCartSummary(): void {
    const items = this.cartItemsSubject.getValue();
    
    if (items.length === 0) {
      this.cartSummarySubject.next(null);
      return;
    }

    const summary: CartSummary = {
      totalItems: items.length,
      totalDays: items.length, // Un tour por día
      totalParticipants: items.reduce((sum, item) => sum + item.totalParticipants, 0),
      totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0),
      startDate: this.currentStartDate,
      endDate: this.currentEndDate,
      items: items
    };

    this.cartSummarySubject.next(summary);
  }

  /**
   * Obtiene un item del carrito por fecha
   */
  getItemByDate(dayDate: string): CartItem | undefined {
    const items = this.cartItemsSubject.getValue();
    return items.find(item => item.dayDate === dayDate);
  }

  /**
   * Limpia todo el carrito
   */
  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.cartSummarySubject.next(null);
    
    // Resetear las selecciones de días
    const currentDays = this.daySelectionsSubject.getValue();
    const resetDays = currentDays.map(day => ({
      ...day,
      isSelected: false,
      tourSelected: undefined
    }));
    
    this.daySelectionsSubject.next(resetDays);
  }

  /**
   * Convierte un SearchToursDto a SlotWithPrices
   */
  convertToSlotsWithPrices(tour: SearchToursDto): SlotWithPrices[] {
    return tour.slots.map(slot => ({
      slotId: slot.slotId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      minCapacity: slot.minCapacity,
      maxCapacity: slot.maxCapacity,
      availableCapacity: slot.maxCapacity, // Por ahora asumimos capacidad completa
      prices: slot.prices
    }));
  }

  /**
   * Crea configuración inicial de participantes basada en los precios del slot
   */
  createParticipantSelections(slotPrices: any[]): ParticipantSelection[] {
    const ageTypeLabels: { [key: string]: string } = {
      'ADULT': 'Adulto',
      'CHILD': 'Niño',
      'INFANT': 'Infante',
      'SENIOR': 'Senior'
    };

    return slotPrices.map(price => ({
      ageType: price.ageType,
      label: ageTypeLabels[price.ageType] || price.ageType,
      minAge: price.minAge,
      maxAge: price.maxAge,
      price: price.price,
      quantity: 0,
      maxQuantity: 10 // Límite por defecto, se puede ajustar según la capacidad del slot
    }));
  }

  /**
   * Genera un ID único para un item del carrito
   */
  generateCartItemId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Valida si la cantidad de participantes está dentro de los límites del slot
   */
  validateParticipantQuantity(participants: ParticipantSelection[], minCapacity: number, maxCapacity: number): boolean {
    const totalParticipants = participants.reduce((sum, p) => sum + p.quantity, 0);
    return totalParticipants >= minCapacity && totalParticipants <= maxCapacity;
  }

  /**
   * Calcula el precio total basado en los participantes seleccionados
   */
  calculateTotalPrice(participants: ParticipantSelection[]): number {
    return participants.reduce((total, participant) => {
      return total + (participant.quantity * participant.price);
    }, 0);
  }
} 