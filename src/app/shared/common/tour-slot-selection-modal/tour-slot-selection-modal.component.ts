import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  AfterViewInit,
  Inject,
} from "@angular/core";
import {
  CartItem,
  SlotWithPrices,
  ParticipantSelection,
} from "../../dto/cart.dto";
import { CartService } from "../../services/cart.service";
import { CarouselModule, OwlOptions } from "ngx-owl-carousel-o";
import dayjs from "dayjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  SlotDto,
  TourScheduleResponseDto,
} from "../../dto/search-tour-response.dto";
import { SearchToursService } from "../../../pages/clients/list-tours/search-tours.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { ModalModule } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { PendingActionService, PendingCartAction } from "../../services/pending-action.service";
import Swal from "sweetalert2";
import { I18nFieldService } from "../../services/i18n-field.service";
import { ReservationService } from "../../services/reservation.service";

@Component({
  selector: "app-tour-slot-selection-modal",
  standalone: true,
  templateUrl: "./tour-slot-selection-modal.component.html",
  styleUrls: ["./tour-slot-selection-modal.component.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SlickCarouselModule,
    MatSlideToggleModule,
    ModalModule,
    CarouselModule
  ],
})
export class TourSlotSelectionModalComponent implements OnInit, AfterViewInit {
  // Modal state
  showModal: boolean = false;
  isProcessing: boolean = false; // Para mostrar loading mientras se guarda en backend

  // Tour data
  selectedTour: TourScheduleResponseDto | null = null;
  selectedDay: string = "";
  availableSlots: SlotDto[] = [];
  selectedSlot: SlotDto | null = null;
  participants: ParticipantSelection[] = [];
  dates: Date[] = [];
  selectedDate: Date | null = null;

  // Validation
  isValid: boolean = false;
  validationErrors: string[] = [];
  totalParticipants: number = 0;
  totalPrice: number = 0;

  // Rescheduling mode
  isRescheduling: boolean = false;

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: [],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: false,
  };

  constructor(
    private cartService: CartService,
    private readonly searchToursService: SearchToursService,
    private router: Router,
    private authService: AuthService,
    private pendingActionService: PendingActionService,
    public i18nService: I18nFieldService,
    private reservationService: ReservationService, // Para reagendamiento
    public dialogRef: MatDialogRef<TourSlotSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      tour: TourScheduleResponseDto;
      dayDate: string;
      checkIn: string;
      checkOut: string;
      isRescheduling?: boolean; // Flag para indicar modo de reagendamiento
      reservationId?: string; // ID de la reserva para reagendar
      originalPrice?: number; // Precio original de la reserva
      tourAdded: (cartItem: CartItem) => void;
    }
  ) {
    this.selectedTour = data.tour;
    this.selectedDay = data.dayDate;
    this.isRescheduling = data.isRescheduling || false; // Inicializar flag
    // this.availableSlots = this.cartService.convertToSlotsWithPrices(data.tour);

    this.resetSelection();
    this.showModal = true;
  }

  ngOnInit(): void {
    this.searchToursService
      .searchTours({
        tourId: this.selectedTour?.tour?.id,
      }, 1, 10)
      .subscribe((data) => {
        if (data && data.content) {
          this.selectedTour = data.content[0];

          const startDateDayjs = dayjs(this.data.checkIn, "YYYY-MM-DD");
          const endDateDayjs = dayjs(this.data.checkOut, "YYYY-MM-DD");

          if (startDateDayjs.isValid() && endDateDayjs.isValid()) {
            this.dates = this.generateDateRange(
              startDateDayjs.toDate(),
              endDateDayjs.toDate()
            );

            const scheduleDates = this.selectedTour.schedules.map(
              (schedule) => {
                return dayjs(schedule.scheduleDate).format("YYYY-MM-DD");
              }
            );

            this.dates = this.dates.filter((date) => {
              const dateString = dayjs(date).format("YYYY-MM-DD");
              return scheduleDates.includes(dateString);
            });

            this.selectedDate =
              this.dates.find((date) => {
                return dayjs(date).format("YYYY-MM-DD") === this.data.dayDate;
              }) || this.dates[0]; // Set default selected date

            this.updateAvailableSlots();
          }
        }
        
        // Verificar si hay acción pendiente después de cargar los datos
        this.checkAndExecutePendingAction();
      });
  }

  ngAfterViewInit() {
    this.dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 0);
    });
  }

  /**
   * Resetea la selección
   */
  private resetSelection(): void {
    this.selectedSlot = null;
    this.participants = [];
    this.totalParticipants = 0;
    this.totalPrice = 0;
    this.isValid = false;
    this.validationErrors = [];
  }

  /**
   * Close modal
   */
  closeModal() {
    this.dialogRef.close();
  }

  /**
   * Selecciona un slot
   */
  selectSlot(slot: SlotDto): void {
    this.selectedSlot = slot;
    if (slot.prices) {
      this.participants = this.cartService.createParticipantSelections(
        slot.prices
      );
    }
    this.updateValidation();
  }

  /**
   * Actualiza la cantidad de participantes
   */
  updateParticipantQuantity(
    participant: ParticipantSelection,
    quantity: number
  ): void {
    participant.quantity = Math.max(
      0,
      Math.min(quantity, participant.maxQuantity)
    );
    this.updateTotals();
    this.updateValidation();
  }

  /**
   * Incrementa la cantidad de participantes
   */
  incrementParticipant(participant: ParticipantSelection): void {
    if (
      participant.quantity < participant.maxQuantity &&
      this.canAddParticipant()
    ) {
      participant.quantity++;
      this.updateTotals();
      this.updateValidation();
    }
  }

  /**
   * Decrementa la cantidad de participantes
   */
  decrementParticipant(participant: ParticipantSelection): void {
    if (participant.quantity > 0) {
      participant.quantity--;
      this.updateTotals();
      this.updateValidation();
    }
  }

  /**
   * Verifica si se puede agregar un participante más
   */
  private canAddParticipant(): boolean {
    if (!this.selectedSlot) return false;
    return this.totalParticipants < this.selectedSlot.maxCapacity;
  }

  /**
   * Actualiza los totales
   */
  private updateTotals(): void {
    this.totalParticipants = this.participants.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
    this.totalPrice = this.cartService.calculateTotalPrice(this.participants);
  }

  /**
   * Actualiza la validación
   */
  private updateValidation(): void {
    this.validationErrors = [];

    if (!this.selectedSlot) {
      this.validationErrors.push("Debe seleccionar un horario");
      this.isValid = false;
      return;
    }

    if (this.totalParticipants === 0) {
      this.validationErrors.push("Debe agregar al menos un participante");
      this.isValid = false;
      return;
    }

    if (
      this.selectedSlot.minCapacity &&
      this.totalParticipants < this.selectedSlot.minCapacity
    ) {
      this.validationErrors.push(
        `Mínimo ${this.selectedSlot.minCapacity} participantes requeridos`
      );
      this.isValid = false;
      return;
    }

    if (this.totalParticipants > this.selectedSlot.maxCapacity) {
      this.validationErrors.push(
        `Máximo ${this.selectedSlot.maxCapacity} participantes permitidos`
      );
      this.isValid = false;
      return;
    }

    this.isValid = true;
  }

  /**
   * Confirma la selección y agrega al carrito o reagenda
   */
  async confirmSelection(): Promise<void> {
    console.log('🚀 ============ INICIO DE confirmSelection() ============');
    console.log('📋 Estado inicial:', {
      isValid: this.isValid,
      hasTour: !!this.selectedTour,
      hasSlot: !!this.selectedSlot,
      isProcessing: this.isProcessing,
      isRescheduling: this.isRescheduling
    });
    
    if (!this.isValid || !this.selectedTour || !this.selectedSlot) {
      console.log('❌ Validación fallida:', { 
        isValid: this.isValid, 
        hasTour: !!this.selectedTour, 
        hasSlot: !!this.selectedSlot 
      });
      return;
    }

    // Si es modo reagendamiento, manejar diferente
    if (this.isRescheduling) {
      console.log('🔄 Modo reagendamiento activado');
      await this.handleReschedule();
      return;
    }

    console.log('🎯 Validación pasada - verificando autenticación...');
    console.log('🔍 Token en localStorage:', localStorage.getItem('token') ? 'SÍ existe' : 'NO existe');
    console.log('🔍 Usuario en localStorage:', localStorage.getItem('user') ? 'SÍ existe' : 'NO existe');

    // Verificar autenticación ANTES de continuar
    const isAuthenticated = this.authService.isAuthenticated();
    const token = this.authService.getToken();
    console.log(`🔐 Estado de autenticación: ${isAuthenticated}`);
    console.log(`🔐 Token obtenido: ${token ? 'Token presente (length: ' + token.length + ')' : 'NO HAY TOKEN'}`);

    if (!isAuthenticated || !token) {
      console.log('⚠️ Usuario NO autenticado - llamando handleUnauthenticatedUser()...');
      this.handleUnauthenticatedUser();
      console.log('✅ handleUnauthenticatedUser() ejecutado - SALIENDO de confirmSelection()');
      return;
    }

    // Usuario autenticado - proceder con la lógica original
    console.log('✅ Usuario autenticado - llamando addToCartInternal()...');
    await this.addToCartInternal();
    console.log('🏁 ============ FIN DE confirmSelection() ============');
  }

  /**
   * Maneja el flujo de reagendamiento
   */
  private async handleReschedule(): Promise<void> {
    console.log('🔄 Iniciando proceso de reagendamiento...');
    
    // Validar que tengamos los datos necesarios
    if (!this.data.reservationId || !this.selectedDate) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Faltan datos para reagendar la reserva'
      });
      return;
    }

    // Validar precio: el nuevo precio debe ser menor o igual al original
    const originalPrice = this.data.originalPrice || 0;
    const newPrice = this.totalPrice;

    console.log('💰 Validación de precios:', {
      originalPrice,
      newPrice,
      isValid: newPrice <= originalPrice
    });

    if (newPrice > originalPrice) {
      Swal.fire({
        icon: 'warning',
        title: 'Precio mayor',
        text: `El nuevo precio ($${newPrice.toFixed(2)}) es mayor al precio original ($${originalPrice.toFixed(2)}). No se puede reagendar.`,
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Formatear la fecha seleccionada
    const newDate = dayjs(this.selectedDate).format('YYYY-MM-DD');
    
    console.log('📅 Reagendando a:', newDate);

    this.isProcessing = true;

    this.reservationService.rescheduleReservation(this.data.reservationId, newDate).subscribe({
      next: (response) => {
        console.log('✅ Reagendamiento exitoso:', response);
        this.isProcessing = false;
        
        // Cerrar el modal inmediatamente
        this.dialogRef.close();
        
        // Navegar a la sección de reservas (bookings)
        this.router.navigate(['/clients/my-profile'], { 
          queryParams: { section: 'bookings' }
        }).then(() => {
          // Mostrar mensaje de éxito después de navegar
          console.log('� Intentando mostrar modal de éxito...');
          
          try {
            Swal.fire({
              icon: 'success',
              title: '¡Reagendamiento Exitoso!',
              html: `
                <div style="text-align: center;">
                  <p style="font-size: 16px; margin-bottom: 10px;">
                    Tu reserva <strong>${this.data.reservationId}</strong> ha sido reagendada exitosamente.
                  </p>
                  <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0; color: #0369a1;">
                      <strong>📅 Nueva fecha:</strong> ${dayjs(newDate).format('DD/MM/YYYY')}
                    </p>
                    <p style="margin: 5px 0; color: #0369a1;">
                      <strong>⏰ Horario:</strong> ${this.selectedSlot?.startTime} - ${this.selectedSlot?.endTime}
                    </p>
                  </div>
                  <p style="font-size: 14px; color: #666;">
                    Los detalles se han actualizado en "Mis Reservas"
                  </p>
                </div>
              `,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#3085d6'
            });
            console.log('✅ Swal.fire() llamado exitosamente');
          } catch (error) {
            console.error('❌ Error al mostrar Swal:', error);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al reagendar:', error);
        this.isProcessing = false;
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'No se pudo reagendar la reserva. Por favor, intenta nuevamente.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Manejar usuario no autenticado
   */
  private handleUnauthenticatedUser(): void {
    console.log('🚨 ============ INICIO DE handleUnauthenticatedUser() ============');
    console.log('📋 Datos disponibles:', {
      hasTour: !!this.selectedTour,
      hasSlot: !!this.selectedSlot,
      hasDate: !!this.selectedDate
    });
    
    if (!this.selectedTour || !this.selectedSlot || !this.selectedDate) {
      console.log('❌ Faltan datos necesarios - SALIENDO sin hacer nada');
      return;
    }

    // Buscar el schedule que coincide con la fecha seleccionada
    const selectedDateStr = new Date(this.selectedDate).toISOString().split('T')[0];
    const matchingSchedule = this.selectedTour.schedules.find(schedule => {
      const scheduleDate = new Date(schedule.scheduleDate).toISOString().split('T')[0];
      return scheduleDate === selectedDateStr;
    });
    
    const tourScheduleId = matchingSchedule?.id || 0;
    console.log('📅 Fecha seleccionada:', selectedDateStr);
    console.log('🔍 Schedule encontrado:', matchingSchedule);
    console.log('🆔 tourScheduleId:', tourScheduleId);

    // Guardar estado actual del modal
    const pendingAction: PendingCartAction = {
      tourId: this.selectedTour.tour.id || 0,
      dayId: tourScheduleId, // Usar el ID real del schedule
      slotId: this.selectedSlot.slotId,
      selectedDate: this.selectedDate,
      participants: this.participants.map(p => ({ ...p })),
      totalPrice: this.totalPrice,
      returnUrl: this.router.url // Guardar URL actual para volver después
    };

    console.log('💾 Guardando acción pendiente:', pendingAction);
    this.pendingActionService.setPendingCartAction(pendingAction);
    console.log('✅ Acción guardada - Total de participantes:', this.totalParticipants);

    // Cerrar el modal
    console.log('� Cerrando modal...');
    this.closeModal();

    // Mostrar mensaje y redirigir a login
    console.log('💬 Mostrando SweetAlert...');
    Swal.fire({
      icon: 'info',
      title: 'Inicia sesión para continuar',
      text: 'Necesitas iniciar sesión para agregar tours a tu carrito',
      confirmButtonText: 'Ir a Iniciar Sesión',
      confirmButtonColor: '#3085d6',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      console.log('📱 Usuario respondió al alert:', result);
      if (result.isConfirmed) {
        // Redirigir a login con returnUrl
        console.log('🔄 Redirigiendo a /login...');
        this.router.navigate(['/login'], { 
          queryParams: { 
            returnUrl: pendingAction.returnUrl 
          } 
        });
      } else {
        // Usuario canceló - limpiar acción pendiente
        console.log('❌ Usuario canceló - limpiando acción pendiente');
        this.pendingActionService.clearPendingAction();
      }
    });
  }

  /**
   * Verificar y ejecutar acción pendiente después de login
   */
  private checkAndExecutePendingAction(): void {
    // Solo ejecutar si el usuario está autenticado y hay acción pendiente
    if (this.authService.isAuthenticated() && this.pendingActionService.hasPendingAction()) {
      const pendingAction = this.pendingActionService.getPendingCartAction();
      
      if (pendingAction) {
        console.log('🔄 Detectada acción pendiente - restaurando estado:', pendingAction);
        
        // Restaurar el estado del modal
        setTimeout(() => {
          this.restoreModalState(pendingAction);
        }, 500);
      }
    }
  }

  /**
   * Restaurar el estado del modal desde la acción pendiente
   */
  private restoreModalState(action: PendingCartAction): void {
    console.log('🔄 Restaurando estado del modal...');
    
    // Restaurar fecha seleccionada
    this.selectedDate = new Date(action.selectedDate);
    console.log('📅 Fecha restaurada:', this.selectedDate);
    
    // Actualizar slots disponibles para esa fecha
    this.updateAvailableSlots();
    
    // Restaurar slot y participantes después de que se carguen los slots
    setTimeout(() => {
      // Buscar y seleccionar el slot
      this.selectedSlot = this.availableSlots.find(s => s.slotId === action.slotId) || null;
      console.log('⏰ Slot restaurado:', this.selectedSlot);
      
      if (this.selectedSlot) {
        // Restaurar participantes
        this.participants = action.participants.map(p => ({ ...p }));
        this.updateTotals();
        console.log('👥 Participantes restaurados:', this.participants);
        
        // Ejecutar automáticamente la acción de agregar al carrito
        setTimeout(() => {
          console.log('✅ Ejecutando acción pendiente automáticamente...');
          this.executePendingAddToCart();
        }, 500);
      } else {
        console.error('❌ No se pudo encontrar el slot con ID:', action.slotId);
        this.pendingActionService.clearPendingAction();
        
        Swal.fire({
          icon: 'warning',
          title: 'Horario no disponible',
          text: 'El horario seleccionado ya no está disponible. Por favor, selecciona otro.',
        });
      }
    }, 500);
  }

  /**
   * Ejecutar la acción de agregar al carrito pendiente
   */
  private async executePendingAddToCart(): Promise<void> {
    try {
      this.isProcessing = true;
      
      console.log('✅ Ejecutando acción pendiente - agregando al carrito...');
      
      // Agregar al carrito
      await this.addToCartInternal();
      
      // Limpiar acción pendiente
      this.pendingActionService.clearPendingAction();
      
      // Mostrar mensaje de éxito especial
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido de nuevo!',
        text: 'El tour ha sido agregado a tu carrito exitosamente',
        timer: 3000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('❌ Error ejecutando acción pendiente:', error);
      this.pendingActionService.clearPendingAction();
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al agregar el tour. Por favor, intenta nuevamente.'
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Lógica interna para agregar al carrito (extraída del método original)
   */
  private async addToCartInternal(): Promise<void> {
    if (!this.selectedTour || !this.selectedSlot) {
      return;
    }

    const dayDate = this.selectedDate
      ? dayjs(this.selectedDate).format("YYYY-MM-DD")
      : "";

    const cartItem: CartItem = {
      id: this.cartService.generateCartItemId(),
      dayDate,
      tour: {
        ...this.selectedTour.tour,
        duration: this.selectedTour?.tour?.duration?.toString(),
      },
      schedule: this.selectedTour.schedules[0],
      selectedSlot: {
        slotId: this.selectedSlot.slotId,
        startTime: this.selectedSlot.startTime,
        endTime: this.selectedSlot.endTime,
        minCapacity: this.selectedSlot.minCapacity,
        maxCapacity: this.selectedSlot.maxCapacity,
      },
      participants: this.participants
        .filter((p) => p.quantity > 0)
        .map((p) => ({
          ageType: p.ageType,
          quantity: p.quantity,
          price: p.price,
        })),
      totalPrice: this.totalPrice,
      totalParticipants: this.totalParticipants,
      address: this.selectedTour?.tour?.address,
      gallery: this.selectedTour?.tour?.gallery,
    };

    // Activar estado de procesamiento
    this.isProcessing = true;

    try {
      console.log("🛒 Agregando tour al carrito con backend...");
      
      // Agregar item al carrito con persistencia en backend
      await this.cartService.addItemToCartWithBackend(cartItem);
      
      console.log("✅ Tour agregado exitosamente al carrito");
      
      // Notificar al componente padre que el tour fue agregado
      this.data.tourAdded(cartItem);
      
      // Cerrar modal
      this.closeModal();
      
    } catch (error: any) {
      console.error("❌ Error agregando tour al carrito:", error);
      console.error("❌ Error status:", error?.status);
      console.error("❌ Error completo:", error);
      
      // Si es error 401 (no autenticado), limpiar sesión y guardar acción pendiente
      if (error.status === 401 || error.status === 403) {
        console.log('🔐 Error de autenticación detectado - limpiando sesión y guardando acción pendiente');
        
        // Limpiar token inválido
        this.authService.removeToken();
        localStorage.removeItem('user');
        
        // Guardar acción pendiente ANTES de redirigir
        if (!this.selectedTour || !this.selectedSlot || !this.selectedDate) {
          return;
        }

        // Buscar el schedule que coincide con la fecha seleccionada
        const selectedDateStr = new Date(this.selectedDate).toISOString().split('T')[0];
        const matchingSchedule = this.selectedTour.schedules.find(schedule => {
          const scheduleDate = new Date(schedule.scheduleDate).toISOString().split('T')[0];
          return scheduleDate === selectedDateStr;
        });
        
        const tourScheduleId = matchingSchedule?.id || 0;
        console.log('📅 (Error 401) Fecha seleccionada:', selectedDateStr);
        console.log('🔍 (Error 401) Schedule encontrado:', matchingSchedule);
        console.log('🆔 (Error 401) tourScheduleId:', tourScheduleId);

        const pendingAction: PendingCartAction = {
          tourId: this.selectedTour.tour.id || 0,
          dayId: tourScheduleId, // Usar el ID real del schedule
          slotId: this.selectedSlot.slotId,
          selectedDate: this.selectedDate,
          participants: this.participants.map(p => ({ ...p })),
          totalPrice: this.totalPrice,
          returnUrl: this.router.url
        };

        this.pendingActionService.setPendingCartAction(pendingAction);
        console.log('💾 Acción pendiente guardada después de error 401:', pendingAction);

        // Cerrar modal
        this.closeModal();

        // Mostrar mensaje y redirigir a login
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.',
          confirmButtonText: 'Ir a Iniciar Sesión',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/login'], { 
              queryParams: { 
                returnUrl: pendingAction.returnUrl 
              } 
            });
          }
        });
        
        return; // Salir del catch
      }
      
      // Otros errores
      let errorMessage = "Error agregando el tour al carrito. Por favor, intenta de nuevo.";
      
      if (error.status === 400) {
        errorMessage = "Datos inválidos. Por favor, verifica tu selección.";
      } else if (error.status === 409) {
        errorMessage = "Este tour ya existe en tu carrito para esta fecha.";
      } else if (error.status === 500) {
        errorMessage = "Error en el servidor. Por favor, contacta a soporte.";
      }
      
      alert(errorMessage); // TODO: Reemplazar con un toast/snackbar más elegante
      
    } finally {
      // Desactivar estado de procesamiento
      this.isProcessing = false;
    }
  }

  /**
   * Formatea el tiempo
   */
  formatTime(time: string): string {
    return time.substring(0, 5); // HH:MM
  }

  /**
   * Formatea el precio en formato de moneda colombiana
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Obtiene la clase CSS para un slot
   */
  getSlotClass(slot: SlotDto): string {
    let classes = "slot-item";

    if (this.selectedSlot?.slotId === slot.slotId) {
      classes += " selected";
    }

    if (slot.maxCapacity === 0) {
      classes += " full";
    }

    return classes;
  }

  /**
   * Verifica si un slot está lleno
   */
  isSlotFull(slot: SlotDto): boolean {
    return slot.maxCapacity === 0;
  }

  /**
   * Obtiene el rango de edades formateado
   */
  getAgeRange(participant: ParticipantSelection): string {
    if (participant.maxAge === 999) {
      return `${participant.minAge}+ años`;
    }
    return `${participant.minAge}-${participant.maxAge} años`;
  }

  /**
   * Verifica si se puede incrementar un participante
   */
  canIncrement(participant: ParticipantSelection): boolean {
    return (
      participant.quantity < participant.maxQuantity && this.canAddParticipant()
    );
  }

  /**
   * Verifica si se puede decrementar un participante
   */
  canDecrement(participant: ParticipantSelection): boolean {
    return participant.quantity > 0;
  }

  /**
   * Obtiene el nombre del tour de manera segura
   */
  getTourName(): string {
    return this.i18nService.getValue(this.selectedTour?.tour?.name) || "";
  }

  /**
   * Obtiene la primera imagen del tour de manera segura
   */
  getTourImage(): string {
    if (
      this.selectedTour?.tour?.gallery &&
      this.selectedTour.tour.gallery.length > 0
    ) {
      return this.selectedTour.tour?.gallery[0]?.imageUrl || "";
    }
    return "";
  }

  /**
   * Verifica si hay imágenes disponibles
   */
  hasImages(): boolean {
    return !!(
      this.selectedTour?.tour?.gallery &&
      this.selectedTour.tour.gallery.length > 0
    );
  }

  /**
   * Obtiene la ubicación del tour de manera segura
   */
  getTourLocation(): string {
    const city = this.selectedTour?.tour?.address?.city || "";
    const state = this.selectedTour?.tour?.address?.state || "";
    return city && state ? `${city}, ${state}` : city || state || "";
  }

  /**
   * Obtiene la duración del tour de manera segura
   */
  getTourDuration(): string {
    return this.selectedTour?.tour?.duration?.toString() || "";
  }

  /**
   * Obtiene el rating del tour de manera segura
   */
  getTourRating(): number | null {
    return this.selectedTour?.tour?.rating || null;
  }

  /**
   * Verifica si tiene rating
   */
  hasRating(): boolean {
    return !!this.selectedTour?.tour?.rating;
  }

  /**
   * Obtiene la descripción del tour de manera segura
   */
  getTourDescription(): string {
    return this.i18nService.getValue(this.selectedTour?.tour?.description) || "";
  }

  generateDateRange(startDate: Date, endDate: Date) {
    const dates = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(new Date(d));
    }

    return dates;
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.resetSelection();
    this.updateAvailableSlots();
  }

  updateAvailableSlots() {
    const selectedDateDayjs = dayjs(this.selectedDate);

    if (this.selectedTour && this.selectedDate) {
      this.availableSlots = this.cartService.convertToSlotsWithPrices(
        this.selectedTour,
        selectedDateDayjs.format("YYYY-MM-DD")
      );
    } else {
      this.availableSlots = [];
    }
  }
}
