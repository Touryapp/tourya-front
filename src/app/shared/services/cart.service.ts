import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import {
  CartItem,
  DaySelection,
  CartSummary,
  SlotWithPrices,
  ParticipantSelection,
} from "../dto/cart.dto";
import {
  SlotDto,
  TourScheduleResponseDto,
} from "../dto/search-tour-response.dto";
import dayjs from "dayjs";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private daySelectionsSubject = new BehaviorSubject<DaySelection[]>([]);
  private cartSummarySubject = new BehaviorSubject<CartSummary | null>(null);

  public cartItems$ = this.cartItemsSubject.asObservable();
  public daySelections$ = this.daySelectionsSubject.asObservable();
  public cartSummary$ = this.cartSummarySubject.asObservable();

  private currentStartDate: string = "";
  private currentEndDate: string = "";
  
  // Flag para evitar cargas múltiples del backend
  private isLoadingFromBackend = false;
  private hasLoadedFromBackend = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Emite nuevos items solo si son diferentes a los actuales (previene loops)
   */
  private setCartItemsIfChanged(items: CartItem[]): void {
    const currentItems = this.cartItemsSubject.value;
    
    // Comparar por contenido para evitar emisiones innecesarias
    try {
      const currentJson = JSON.stringify(currentItems);
      const newJson = JSON.stringify(items);
      
      if (currentJson === newJson) {
        console.log('🔄 CartService: Items sin cambios, no emitir');
        return;
      }
    } catch (error) {
      console.warn('⚠️ CartService: Error comparando items, emitiendo de todos modos', error);
    }
    
    console.log('✅ CartService: Emitiendo items actualizados', items.length, 'items');
    this.cartItemsSubject.next(items);
    this.updateCartSummary();
  }

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
  private calculateDaysBetweenDates(
    startDate: string,
    endDate: string
  ): DaySelection[] {
    const days: DaySelection[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!startDate || !endDate || start >= end) {
      return days;
    }

    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    let current = new Date(start);
    let dayNumber = 1;

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const dayName = dayNames[current.getDay()];

      days.push({
        date: dateStr,
        dayName: dayName,
        dayNumber: dayNumber,
        isSelected: false,
        availableTours: 0, // Se actualizará cuando se carguen los tours
      });

      current.setDate(current.getDate() + 1);
      dayNumber++;
    }

    return days;
  }

  /**
   * Actualiza la cantidad de tours disponibles para cada día
   */
  updateAvailableToursForDays(tours: TourScheduleResponseDto[]): void {
    const currentDays = this.daySelectionsSubject.getValue();

    const updatedDays = currentDays.map((day) => {
      const toursForDay = tours.filter((tour) => {
        const tourDates = tour.schedules.map((schedule) => {
          return new Date(schedule.scheduleDate || "")
            .toISOString()
            .split("T")[0];
        });

        return tourDates.includes(day.date);
      });

      console.log(
        `CartService: Día ${day.date} - Tours disponibles: ${toursForDay.length}`
      );

      return {
        ...day,
        availableTours: toursForDay.length,
      };
    });

    console.log("CartService: Emitiendo días actualizados:", updatedDays);
    this.daySelectionsSubject.next(updatedDays);
  }

  /**
   * Agrega un item al carrito (solo local - sin persistencia en backend)
   * @deprecated Use addItemToCartWithBackend for persistence
   */
  addItemToCart(cartItem: CartItem): void {
    console.log("CartService: Agregando item al carrito (solo local):", cartItem);
    const currentItems = this.cartItemsSubject.getValue();

    // Verificar si ya existe un tour para ese día
    const existingItemIndex = currentItems.findIndex(
      (item) => item.dayDate === cartItem.dayDate
    );

    if (existingItemIndex >= 0) {
      // Reemplazar el tour existente para ese día
      console.log(
        "CartService: Reemplazando tour existente para el día:",
        cartItem.dayDate
      );
      currentItems[existingItemIndex] = cartItem;
    } else {
      // Agregar nuevo item
      console.log(
        "CartService: Agregando nuevo tour para el día:",
        cartItem.dayDate
      );
      currentItems.push(cartItem);
    }

    this.setCartItemsIfChanged([...currentItems]);
    this.updateDaySelection(cartItem.dayDate, cartItem);
    console.log(
      "CartService: Item agregado. Total items en carrito:",
      currentItems.length
    );
  }

  /**
   * Agrega un item al carrito Y lo persiste en el backend
   * Este es el método recomendado para usar en producción
   */
  async addItemToCartWithBackend(cartItem: CartItem): Promise<void> {
    console.log("CartService: Agregando item al carrito con backend:", cartItem);
    
    try {
      // 1. Convertir CartItem al formato esperado por la API
      const apiItem = this.convertCartItemToApiFormat(cartItem);
      
      console.log("CartService: Item convertido al formato API:", apiItem);
      
      // 2. Agregar item localmente primero (para feedback inmediato en la UI)
      this.addItemToCart(cartItem);
      
      // 3. Persistir en el backend
      await this.createOrAddCartItems([apiItem]);
      
      console.log("CartService: Item agregado exitosamente al backend y carrito local");
      
    } catch (error: any) {
      console.error("CartService: Error agregando item al carrito:", error);
      
      // Si falla el backend, remover del carrito local para mantener consistencia
      this.removeItemFromCart(cartItem.dayDate);
      
      // Re-lanzar el error para que el componente lo maneje
      throw error;
    }
  }

  /**
   * Convierte un CartItem del frontend al formato esperado por la API
   */
  private convertCartItemToApiFormat(cartItem: CartItem): any {
    // Preparar configQuantity filtrando participantes con cantidad > 0
    const configQuantity = cartItem.participants
      .filter(p => p.quantity > 0)
      .map(p => ({
        ageType: p.ageType,
        quantity: p.quantity
      }));

    return {
      productId: cartItem.tour.id,
      productType: "TOUR",
      scheduleDate: cartItem.dayDate,
      tourScheduleId: cartItem.schedule.id,
      slot: {
        id: cartItem.selectedSlot.slotId,
        configQuantity: configQuantity
      }
    };
  }

  /**
   * Remueve un item del carrito
   */
  removeItemFromCart(dayDate: string): void {
    const currentItems = this.cartItemsSubject.getValue();
    const filteredItems = currentItems.filter(
      (item) => item.dayDate !== dayDate
    );

    this.setCartItemsIfChanged(filteredItems);
    this.updateDaySelection(dayDate, undefined);
    this.updateCartSummary();
  }

  /**
   * Actualiza la selección de un día específico
   */
  private updateDaySelection(dayDate: string, cartItem?: CartItem): void {
    const currentDays = this.daySelectionsSubject.getValue();
    const updatedDays = currentDays.map((day) => {
      if (day.date === dayDate) {
        return {
          ...day,
          isSelected: !!cartItem,
          tourSelected: cartItem,
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
      totalParticipants: items.reduce(
        (sum, item) => sum + item.totalParticipants,
        0
      ),
      totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0),
      startDate: this.currentStartDate,
      endDate: this.currentEndDate,
      items: items,
    };

    this.cartSummarySubject.next(summary);
  }

  /**
   * Obtiene un item del carrito por fecha
   */
  getItemByDate(dayDate: string): CartItem | undefined {
    const items = this.cartItemsSubject.getValue();
    return items.find((item) => item.dayDate === dayDate);
  }

  /**
   * Limpia todo el carrito
   */
  clearCart(): void {
    console.log('🗑️ CartService: Limpiando carrito completo');
    this.setCartItemsIfChanged([]);
    this.cartSummarySubject.next(null);

    // Resetear las selecciones de días
    const currentDays = this.daySelectionsSubject.getValue();
    const resetDays = currentDays.map((day) => ({
      ...day,
      isSelected: false,
      tourSelected: undefined,
    }));

    this.daySelectionsSubject.next(resetDays);
  }

  /**
   * Convierte un SearchToursDto a SlotWithPrices
   */
  convertToSlotsWithPrices(
    tour: TourScheduleResponseDto,
    date: string
  ): SlotDto[] {
    const schedule = tour.schedules.find((schedule) => {
      return (
        dayjs(schedule.scheduleDate).format("YYYY-MM-DD") ===
        dayjs(date).format("YYYY-MM-DD")
      );
    });

    return schedule && schedule.config && schedule.config.slots
      ? schedule.config.slots
      : [];
  }

  /**
   * Crea configuración inicial de participantes basada en los precios del slot
   */
  createParticipantSelections(slotPrices: any[]): ParticipantSelection[] {
    const ageTypeLabels: { [key: string]: string } = {
      ADULT: "Adulto",
      CHILD: "Niño",
      INFANT: "Infante",
      SENIOR: "Senior",
    };

    return slotPrices.map((price) => ({
      ageType: price.ageType,
      label: ageTypeLabels[price.ageType] || price.ageType,
      minAge: price.minAge,
      maxAge: price.maxAge,
      price: price.price,
      quantity: 0,
      maxQuantity: 10, // Límite por defecto, se puede ajustar según la capacidad del slot
    }));
  }

  /**
   * Genera un ID único para un item del carrito
   */
  generateCartItemId(): string {
    return "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Valida si la cantidad de participantes está dentro de los límites del slot
   */
  validateParticipantQuantity(
    participants: ParticipantSelection[],
    minCapacity: number,
    maxCapacity: number
  ): boolean {
    const totalParticipants = participants.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
    return totalParticipants >= minCapacity && totalParticipants <= maxCapacity;
  }

  /**
   * Calcula el precio total basado en los participantes seleccionados
   */
  calculateTotalPrice(participants: ParticipantSelection[]): number {
    return participants.reduce((total, participant) => {
      return total + participant.quantity * participant.price;
    }, 0);
  }

  // 🆕 API INTEGRATION METHODS
  
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
   * Cargar carrito desde el backend (solo una vez por sesión)
   */
  async loadCartFromBackend(force: boolean = false): Promise<void> {
    // Prevenir cargas múltiples simultáneas
    if (this.isLoadingFromBackend) {
      console.log('⏳ CartService: Ya hay una carga en progreso, esperando...');
      return;
    }

    // Si ya se cargó y no es forzado, no recargar
    if (this.hasLoadedFromBackend && !force) {
      console.log('✅ CartService: Carrito ya cargado previamente');
      return;
    }

    this.isLoadingFromBackend = true;
    console.log('🔄 CartService: Cargando carrito desde backend...');

    try {
      const headers = this.getAuthHeaders();
      const response = await this.http.get<any>(
        `${environment.apiUrl}/shopping-cart/user`,
        { headers }
      ).toPromise();

      console.log('📦 Shopping cart API response:', response);

      if (response && response.items && response.items.length > 0) {
        const activeItems = response.items.filter((item: any) => item.status === 'ACTIVE');
        if (activeItems.length > 0) {
          const mappedItems = this.mapApiResponseToCartItems(activeItems);
          this.setCartItemsIfChanged(mappedItems);
          console.log('✅ Carrito cargado desde backend:', mappedItems.length, 'items activos');
        } else {
          console.log('📭 No hay items activos en el carrito');
          this.setCartItemsIfChanged([]);
        }
      } else {
        console.log('📭 Carrito vacío desde backend');
        this.setCartItemsIfChanged([]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando carrito desde backend:', error);
      
      // Si es error 404, significa que el usuario no tiene carrito
      if (error.status === 404) {
        console.log('📭 Usuario no tiene carrito (404) - estableciendo carrito vacío');
        this.setCartItemsIfChanged([]);
        // No throw error aquí, es un estado válido para usuarios nuevos
      } else {
        // Para otros errores, propagar el error
        throw error;
      }
    } finally {
      // Marcar como cargado y liberar el lock
      this.hasLoadedFromBackend = true;
      this.isLoadingFromBackend = false;
      console.log('🏁 CartService: Carga completada');
    }
  }

  /**
   * Forzar recarga del carrito desde el backend
   */
  async reloadCartFromBackend(): Promise<void> {
    console.log('🔄 Forzando recarga del carrito...');
    this.hasLoadedFromBackend = false;
    return this.loadCartFromBackend(true);
  }

  /**
   * Crea o agrega items al carrito en el backend
   */
  async createOrAddCartItems(items: any[]): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      const body = { items };
      
      console.log('Creando/agregando items al carrito:', body);
      
      const response = await this.http.post(
        `${environment.apiUrl}/shopping-cart/items`,
        body,
        { headers }
      ).toPromise();

      console.log('✅ Items agregados al carrito exitosamente:', response);
      
      // IMPORTANTE: Forzar recarga desde backend para sincronizar IDs reales
      console.log('🔄 Recargando carrito desde backend para sincronizar...');
      await this.reloadCartFromBackend();
      
    } catch (error: any) {
      console.error('❌ Error creando/agregando items al carrito:', error);
      
      // Si falla, intentar recargar para sincronizar estado
      try {
        console.log('⚠️ Intentando sincronizar estado después de error...');
        await this.reloadCartFromBackend();
      } catch (reloadError) {
        console.error('❌ Error sincronizando estado:', reloadError);
      }
      
      throw error;
    }
  }

  /**
   * Método helper para crear un item en el formato esperado por la API
   */
  createCartItemPayload(
    productId: number,
    scheduleDate: string,
    tourScheduleId: number,
    slotId: number,
    ageConfigs: { ageType: string, quantity: number }[]
  ): any {
    return {
      productId,
      productType: "TOUR",
      scheduleDate,
      tourScheduleId,
      slot: {
        id: slotId,
        configQuantity: ageConfigs
      }
    };
  }

  /**
   * Ejemplo de uso para agregar un tour al carrito
   * @param productId ID del producto/tour
   * @param scheduleDate Fecha del tour (YYYY-MM-DD)
   * @param tourScheduleId ID del schedule del tour
   * @param slotId ID del slot
   * @param adults Cantidad de adultos
   * @param children Cantidad de niños (opcional)
   */
  async addTourToCart(
    productId: number,
    scheduleDate: string,
    tourScheduleId: number,
    slotId: number,
    adults: number,
    children: number = 0
  ): Promise<void> {
    const ageConfigs: { ageType: string, quantity: number }[] = [];
    
    if (adults > 0) {
      ageConfigs.push({ ageType: "ADULT", quantity: adults });
    }
    
    if (children > 0) {
      ageConfigs.push({ ageType: "CHILD", quantity: children });
    }

    const tourItem = this.createCartItemPayload(
      productId,
      scheduleDate,
      tourScheduleId,
      slotId,
      ageConfigs
    );

    await this.createOrAddCartItems([tourItem]);
  }

  /**
   * Método simple para cargar items directamente al carrito local
   * sin duplicar ni llamar al backend
   */
  loadItemsToLocalCart(items: CartItem[]): void {
    console.log('📥 Cargando items al carrito local:', items.length);
    
    // Limpiar carrito actual antes de cargar los nuevos
    this.setCartItemsIfChanged(items);
    
    console.log('✅ Items cargados al carrito local exitosamente');
  }

  /**
   * Sincronizar carrito local con backend cuando backend está vacío
   */
  async syncLocalCartWithBackend(): Promise<void> {
    try {
      // Obtener items del carrito local
      const localItems = this.cartItemsSubject.value;
      
      if (localItems.length === 0) {
        console.log('No hay items locales para sincronizar');
        return;
      }
      
      console.log('Sincronizando', localItems.length, 'items locales con backend...');
      
      // Convertir items locales al formato de API
      const apiItems = localItems.map(item => {
        return this.createCartItemPayload(
          item.tour.id,              // productId
          item.dayDate,              // scheduleDate
          item.schedule.id,          // tourScheduleId
          item.selectedSlot.slotId,  // slotId
          item.participants.map((p: any) => ({
            ageType: p.ageType,
            quantity: p.quantity
          }))
        );
      });
      
      // Llamar POST API
      await this.createOrAddCartItems(apiItems);
      
      console.log('Carrito local sincronizado exitosamente con backend');
      
    } catch (error) {
      console.error('Error sincronizando carrito local con backend:', error);
      throw error;
    }
  }

  /**
   * Cargar items del carrito desde el backend sin duplicar
   */
  async loadCartItemsFromBackendOnly(): Promise<void> {
    try {
      await this.loadCartFromBackend();
      
      console.log('✅ Items cargados desde backend');
      
    } catch (error) {
      console.error('❌ Error cargando items del carrito desde backend:', error);
    }
  }

  /**
   * Eliminar item del carrito via API
   */
  async removeCartItemFromBackend(itemId: number): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      
      // Primero necesitamos obtener el cartId del usuario
      // Para esto, podemos hacer una llamada a la API o usar el cartId que guardamos
      const cartResponse = await this.http.get(
        `${environment.apiUrl}/shopping-cart/user`,
        { headers }
      ).toPromise() as any;
      
      const cartId = cartResponse.id;
      
      await this.http.delete(
        `${environment.apiUrl}/shopping-cart/${cartId}/items/${itemId}`,
        { headers }
      ).toPromise();

      console.log('Item eliminado del backend:', itemId, 'del cart:', cartId);
      
      // Recargar carrito después de eliminar
      await this.loadCartFromBackend();
      
    } catch (error) {
      console.error('Error eliminando item del carrito:', error);
      throw error;
    }
  }

  /**
   * Mapear respuesta de API a CartItems del frontend
   */
  private mapApiResponseToCartItems(apiItems: any[]): CartItem[] {
    return apiItems.map(item => ({
      id: item.id.toString(), // ✅ API: item.id
      dayDate: item.scheduleDate, // ✅ API: item.scheduleDate
      tour: {
        id: item.productId, // ✅ API: item.productId
        name: item.tourName || 'Tour sin nombre', // ✅ API: item.tourName
        description: 'Descubre los lugares más emblemáticos de la ciudad en este increíble recorrido', // TODO: API call to /tours/{productId}
        duration: '8 horas', // TODO: API call to /tours/{productId}
        rating: 4.5 // TODO: API call to /tours/{productId} - ratings promedio
      },
      schedule: {
        id: item.tourScheduleId, // ✅ API: item.tourScheduleId
        scheduleDate: item.scheduleDate, // ✅ API: item.scheduleDate
        startTime: '09:00', // TODO: API call to /tour-schedules/{tourScheduleId}
        endTime: '17:00' // TODO: API call to /tour-schedules/{tourScheduleId}
      },
      selectedSlot: {
        slotId: item.slotId || 0, // ✅ API: item.slotId
        startTime: '09:00', // TODO: API call to /slots/{slotId}
        endTime: '17:00', // TODO: API call to /slots/{slotId}
        minCapacity: 2, // TODO: API call to /slots/{slotId}
        maxCapacity: 15 // TODO: API call to /slots/{slotId}
      },
      participants: item.details.map((detail: any) => ({
        ageType: detail.ageType.name, // ✅ API: detail.ageType.name
        quantity: detail.quantity, // ✅ API: detail.quantity
        price: detail.unitPrice // ✅ API: detail.unitPrice
      })),
      totalPrice: item.totalPrice, // ✅ API: item.totalPrice
      totalParticipants: item.details.reduce((sum: number, detail: any) => sum + detail.quantity, 0), // ✅ Calculado
      address: {
        city: 'Cartagena', // TODO: API call to /tours/{productId} - meetingPoint.city
        state: 'Bolívar', // TODO: API call to /tours/{productId} - meetingPoint.state
        country: 'Colombia', // TODO: API call to /tours/{productId} - meetingPoint.country
        address: 'Plaza de la Aduana, Centro Histórico' // TODO: API call to /tours/{productId} - meetingPoint.address
      },
      gallery: [
        { 
          imageUrl: 'assets/img/tours/default-tour.jpg',
          description: 'Vista principal del tour',
          order: 1
        }
      ] // TODO: API call to /tours/{productId} - gallery images array
    }));
  }

  /**
   * Sincronizar carrito con backend (método helper)
   */
  async syncCartWithBackend(): Promise<void> {
    await this.loadCartFromBackend();
  }


}
