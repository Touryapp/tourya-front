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
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";
import {
  SlotDto,
  TourScheduleResponseDto,
} from "../../dto/search-tour-response.dto";
import { SearchToursService } from "../../../pages/clients/list-tours/search-tours.service";
import { AddressCompleteResponseDto } from "../../dto/tourist-profile.dto";
import Swal from "sweetalert2";


import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { ModalModule } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { PendingActionService, PendingCartAction } from "../../services/pending-action.service";

import { I18nFieldService } from "../../services/i18n-field.service";
import { ReservationService } from "../../services/reservation.service";
import { RescheduleConfirmationModalComponent } from "../reschedule-confirmation-modal/reschedule-confirmation-modal.component";
import { GuestInfoModalComponent } from "../guest-info-modal/guest-info-modal.component";
import { TouristService } from "../../services/tourist.service";


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
    CarouselModule,
    RescheduleConfirmationModalComponent
  ],
})
export class TourSlotSelectionModalComponent implements OnInit, AfterViewInit {
  // Modal state
  showModal: boolean = false;
  isProcessing: boolean = false; // Para mostrar loading mientras se guarda en backend
  shouldConsumeService: boolean = true; // Variable quemada a petición del usuario
  isAddressCheckLoading: boolean = false;


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

  // Group selection (for priceType === 'group')
  groupCount: number = 1;
  showGroupError: boolean = false;
  showParticipantError: boolean = false;

  get isCurrentScheduleUnlimited(): boolean {
    return false;
  }

  /**
   * Retorna la disponibilidad del schedule activo.
   * Para tours tipo "group" = cuántos grupos caben.
   * Para tours tipo "individual" = cuántos participantes caben.
   */
  get currentAvailability(): number {
    if (!this.selectedTour || !this.selectedDate) return 99;
    
    const dateStr = dayjs(this.selectedDate).format("YYYY-MM-DD");
    const schedule = this.selectedTour.schedules.find(s =>
      dayjs(s.scheduleDate).format("YYYY-MM-DD") === dateStr
    );
    if (!schedule) return 99;

    // Priorizar availability del slot seleccionado
    // Campo: slot.availability
    const slotAvailability = this.selectedSlot?.availability;

    if (slotAvailability !== null && slotAvailability !== undefined) {
      return slotAvailability;
    }

    // Fallback al primer slot si no hay seleccionado
    const firstSlotAvailability = schedule?.config?.slots?.[0]?.availability;
    if (firstSlotAvailability !== null && firstSlotAvailability !== undefined) {
      return firstSlotAvailability;
    }

    // Último recurso: capacidad calculada
    return Math.max(0, (schedule.capacity || 0) - (schedule.reservedCapacity || 0));
  }

  /**
   * Obtiene la disponibilidad total de un día sumando la disponibilidad de sus slots
   * o calculándola a partir de su capacidad máxima.
   */
  getDayAvailability(date: Date): number | string {
    if (!this.selectedTour) return 0;
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const schedule = this.selectedTour.schedules.find(s =>
      dayjs(s.scheduleDate).format("YYYY-MM-DD") === dateStr
    );
    if (!schedule) return 0;
    


    if (schedule.config && schedule.config.slots && schedule.config.slots.length > 0) {
      return schedule.config.slots.reduce((total: number, slot: any) => total + (slot.availability || 0), 0);
    }
    
    return (schedule.capacity || 0) - (schedule.reservedCapacity || 0);
  }

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
    private dialog: MatDialog, // Para abrir el modal de confirmación
    private touristService: TouristService,
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
      travellersData?: {
        adults: number;
        children: number;
        infants: number;
        cabinClass: string;
      };
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
    // Recuperar datos de búsqueda del localStorage
    const userActionsTraceStr = localStorage.getItem('userActionsTrace');
    let searchBody: any = {
      tourId: this.selectedTour?.tour?.id,
      language: 'es'
    };

    if (userActionsTraceStr) {
      try {
        const trace = JSON.parse(userActionsTraceStr);
        if (trace.checkIn) searchBody.startDate = trace.checkIn;
        if (trace.checkOut) searchBody.endDate = trace.checkOut;
      } catch (e) {
        console.error('Error parsing userActionsTrace', e);
      }
    }

    this.searchToursService
      .searchTours(searchBody, 1, 10)
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

            const scheduleDates = (this.selectedTour.schedules || []).map(
              (schedule) => {
                return dayjs(schedule.scheduleDate).format("YYYY-MM-DD");
              }
            );

            this.dates = this.dates.filter((date) => {
              const dateString = dayjs(date).format("YYYY-MM-DD");
              return scheduleDates.includes(dateString);
            });

            const matchedDate = this.dates.find((date) => {
              return dayjs(date).format("YYYY-MM-DD") === this.data.dayDate;
            });
            this.selectedDate = matchedDate || null;

            // Inicializar participantes genéricamente para que la sección sea visible aunque no haya fecha elegida
            if (!this.selectedDate) {
              const allSlots = this.selectedTour.schedules.flatMap(s => s.config?.slots || []);
              const firstPrices = allSlots.length > 0 ? (allSlots[0].prices || []) : [];
              this.initOrUpdateParticipants(firstPrices, this.currentAvailability);
            }

            this.updateAvailableSlots();
          }
        }
        
        // Verificar si hay acción pendiente después de cargar los datos
        this.checkAndExecutePendingAction();
      });

    // Cargar dinámicamente si debe consumir el servicio (si el perfil está completo)
    if (this.authService.isAuthenticated()) {
      this.isAddressCheckLoading = true;
      this.touristService.checkAddressComplete().subscribe({
        next: (res: AddressCompleteResponseDto) => {
          this.shouldConsumeService = res.addressComplete;
          this.isAddressCheckLoading = false;
          console.log('📄 Estado de perfil (addressComplete):', res.addressComplete);
        },
        error: (err) => {
          console.error('❌ Error al verificar completitud de perfil:', err);
          this.shouldConsumeService = true; // Fallback a true para no bloquear el flujo
          this.isAddressCheckLoading = false;
        }
      });
    } else {

      this.shouldConsumeService = true; // Por defecto true si no está autenticado (seguirá flujo de login)
      this.isAddressCheckLoading = false;
    }
  }

  /**
   * Refresca el estado de completitud del perfil
   */
  private refreshProfileCheck() {
    this.isAddressCheckLoading = true;
    this.touristService.checkAddressComplete().subscribe({
      next: (res: AddressCompleteResponseDto) => {
        this.shouldConsumeService = res.addressComplete;
        this.isAddressCheckLoading = false;
        console.log('🔄 Estado de perfil refrescado:', res.addressComplete);
      },
      error: (err) => {
        console.error('❌ Error al refrescar estado de perfil:', err);
        this.shouldConsumeService = true;
        this.isAddressCheckLoading = false;
      }
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
    // ¡NO BORRAR LOS PARTICIPANTES! Se conservan entre cambios de fecha
    // this.participants = [];
    this.totalPrice = 0;
    this.isValid = false;
    this.validationErrors = [];
    // Mantrar groupCount previo
    this.showGroupError = false;
    this.showParticipantError = false;
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
    
    const capacityLimit = (slot.capacity && slot.capacity > 0) ? slot.capacity : 99;
    const participantMax = (slot.availability || capacityLimit);

    this.initOrUpdateParticipants(slot.prices ?? [], participantMax);

    this.showGroupError = false;
    this.showParticipantError = false;

    this.updateTotals();
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
      this.showParticipantError = false;
      this.updateTotals();
      this.updateValidation();
    } else {
      this.showParticipantError = true;
    }
  }

  /**
   * Decrementa la cantidad de participantes
   */
  decrementParticipant(participant: ParticipantSelection): void {
    if (participant.quantity > 0) {
      participant.quantity--;
      this.showParticipantError = false;
      this.updateTotals();
      this.updateValidation();
    }
  }

  /**
   * Actualiza la cantidad de grupos
   */
  updateGroupCount(count: number): void {
    const availability = this.currentAvailability;
    if (count > availability) {
      this.showGroupError = true;
      this.groupCount = availability;
    } else {
      this.showGroupError = false;
      this.groupCount = Math.max(1, count);
    }
    this.updateParticipantLimits();
    this.updateTotals();
    this.updateValidation();
  }

  /**
   * Incrementa la cantidad de grupos
   */
  incrementGroup(): void {
    const availability = this.currentAvailability;
    if (this.groupCount < availability) {
      this.groupCount++;
      this.showGroupError = false;
    } else {
      this.showGroupError = true;
    }
    this.updateParticipantLimits();
    this.updateTotals();
    this.updateValidation();
  }

  /**
   * Decrementa la cantidad de grupos
   */
  decrementGroup(): void {
    if (this.groupCount > 1) {
      this.groupCount--;
      this.showGroupError = false;
    }
    this.updateParticipantLimits();
    this.updateTotals();
    this.updateValidation();
  }

  /**
   * Verifica si se puede agregar un participante más
   */
  private canAddParticipant(): boolean {
    const isGroup = this.selectedTour?.tour?.priceType === 'group';

    if (isGroup) {
      // 1. Para tours grupo: el límite de personas total es (maxPeople * groupCount)
      const maxPeople = this.selectedTour?.tour?.maxPeople || 99;
      const totalCapacity = maxPeople * this.groupCount;
      return this.totalParticipants < totalCapacity;
    }

    // Para individual, se debe comparar contra la limitante de availability.
    // (Asegurando que la sumatoria total no exceda la capacidad disponible actual).
    return this.totalParticipants < this.currentAvailability;
  }

  /**
   * Actualiza los límites (maxQuantity) de los participantes basándose en el tipo de tour y disponibilidad
   */
  private updateParticipantLimits(): void {
    if (!this.selectedTour) return;

    const isGroup = this.selectedTour?.tour?.priceType === 'group';
    let maxCap = 99;

    if (isGroup) {
      // Para grupos: capacidad total = maxPeople * groupCount
      const maxPeoplePerGroup = this.selectedTour?.tour?.maxPeople || 99;
      maxCap = maxPeoplePerGroup * this.groupCount;
    } else {
      // Para individuales: disponibilidad directa del slot
      maxCap = this.currentAvailability;
    }

    this.participants.forEach(p => {
      p.maxQuantity = maxCap;
    });
  }

  /**
   * Actualiza los totales
   */
  private updateTotals(): void {
    this.totalParticipants = this.participants.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
    
    if (this.selectedTour?.tour?.priceType === 'group') {
      const baseGroupPrice = this.participants.length > 0 ? Math.max(...this.participants.map(p => p.price)) : 0;
      this.totalPrice = baseGroupPrice * this.groupCount;
    } else {
      this.totalPrice = this.cartService.calculateTotalPrice(this.participants);
    }
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

    // minCapacity verification removed

    const availability = this.currentAvailability;
    const isGroup = this.selectedTour?.tour?.priceType === 'group';

    if (isGroup) {
      // 1. Validar grupos disponibles (Campo: slot.availability)
      if (this.groupCount > availability) {
        this.validationErrors.push(`No hay suficientes grupos disponibles (${availability} disponibles)`);
        this.isValid = false;
        return;
      }
      
      // 2. Validar participantes por grupo (Campo: tour.maxPeople)
      const maxPeoplePerGroup = this.selectedTour?.tour?.maxPeople || 99;
      const totalCapacity = maxPeoplePerGroup * this.groupCount;
      
      if (this.totalParticipants > totalCapacity) {
        this.validationErrors.push(`El número de participantes excede la capacidad total de los grupos seleccionados (${totalCapacity} personas)`);
        this.isValid = false;
        return;
      }

      // Advertencia de sillas vacías
      if (this.totalParticipants > 0 && this.totalParticipants < this.groupCount) {
        this.validationErrors.push(`Estás seleccionando menos participantes que la cantidad de grupos "vas a tener sillas vacías"`);
        this.isValid = false;
        return;
      }
    } else {
      // 1. Validar cupos disponibles (Individual - Campo: slot.availability)
      if (this.totalParticipants > availability) {
        this.validationErrors.push(`No hay suficiente cupo para la cantidad de participantes seleccionada. Disponibles: ${availability}`);
        this.isValid = false;
        return;
      }
    }

    this.isValid = true;
  }

  /**
   * Confirma la selección y agrega al carrito o reagenda
   */
  async confirmSelection(): Promise<void> {
    if (this.isAddressCheckLoading) {
      console.log('⏳ Esperando respuesta de validación de perfil...');
      return;
    }


    // Si es ilimitado pero no es válido (por ej: 0 participantes), mostrar alerta
    if (this.isCurrentScheduleUnlimited && !this.isValid) {
      if (this.validationErrors.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Selección incompleta',
          text: this.validationErrors[0],
          confirmButtonColor: '#3085d6'
        });
        return;
      }
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

    console.log('💰 Resumen de precios:', {
      originalPrice,
      newPrice
    });

    // Formatear la fecha seleccionada
    const newDateStr = dayjs(this.selectedDate).format('YYYY-MM-DD');
    const newTime = `${this.selectedSlot?.startTime || ''} - ${this.selectedSlot?.endTime || ''}`;
    
    console.log('📅 Preparando confirmación de reagendamiento para:', newDateStr);

    // Abrir el modal de confirmación
    const confirmRef = this.dialog.open(RescheduleConfirmationModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        reservationId: this.data.reservationId,
        tourName: this.getTourName(),
        newDate: newDateStr,
        newTime: newTime,
        slotId: this.selectedSlot?.slotId,
        startTime: this.selectedSlot?.startTime,
        endTime: this.selectedSlot?.endTime,
        participants: this.participants
          .filter(p => p.quantity > 0)
          .map(p => ({ label: p.label, quantity: p.quantity })),
        configQuantity: this.participants
          .filter(p => p.quantity > 0)
          .map(p => ({ ageType: p.ageType, quantity: p.quantity })),
        newTotalPrice: this.totalPrice,
        originalPrice: originalPrice,
        groupCount: this.groupCount
      }
    });

    // Cerrar este modal DESPUÉS de abrir el nuevo para evitar que se pierda el contexto
    this.dialogRef.close();

    confirmRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        console.log('❌ Reagendamiento cancelado por el usuario');
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

    const matchingSchedule = this.selectedTour.schedules.find(s => 
      dayjs(s.scheduleDate).format("YYYY-MM-DD") === dayDate
    ) || this.selectedTour.schedules[0];

    const cartItem: CartItem = {
      id: this.cartService.generateCartItemId(),
      groupCount: this.selectedTour?.tour?.priceType === 'group' ? this.groupCount : undefined,
      dayDate,
      tour: {
        ...this.selectedTour.tour,
        duration: this.selectedTour?.tour?.duration?.toString(),
      },
      schedule: matchingSchedule,
      selectedSlot: {
        slotId: this.selectedSlot.slotId,
        startTime: this.selectedSlot.startTime,
        endTime: this.selectedSlot.endTime,
        capacity: this.selectedSlot.capacity,
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
      if (this.shouldConsumeService) {
        console.log("🛒 Agregando tour al carrito con backend...");
        
        // Agregar item al carrito con persistencia en backend
        await this.cartService.addItemToCartWithBackend(cartItem);
        
        console.log("✅ Tour agregado exitosamente al carrito");
        
        // Notificar al componente padre que el tour fue agregado
        this.data.tourAdded(cartItem);
        
        // Cerrar modal
        this.closeModal();
      } else {
        console.log("⚠️ Abriendo modal de información de huésped...");
        
        const guestModalRef = this.dialog.open(GuestInfoModalComponent, {
          width: '700px',
          maxWidth: '95vw',
          data: { cartItem }
        });

        guestModalRef.afterClosed().subscribe(result => {
          this.isProcessing = false;
          
          if (result && typeof result === 'object') {
            const { profileSuccess, photoSuccess, photoAttempted } = result;
            
            let htmlContent = '<div style="text-align: left; margin-top: 10px; font-size: 1.1rem;">';
            if (photoAttempted) {
              htmlContent += `<p>${photoSuccess ? '✅' : '❌'} <strong>Foto de perfil:</strong> ${photoSuccess ? 'Cargada correctamente' : 'Error al cargar'}</p>`;
            }
            htmlContent += `<p>${profileSuccess ? '✅' : '❌'} <strong>Datos del perfil:</strong> ${profileSuccess ? 'Actualizados correctamente' : 'Error al actualizar'}</p>`;
            htmlContent += '</div>';

            const isTotalSuccess = (!photoAttempted || photoSuccess) && profileSuccess;

            // Forzamos el Swal a que se dispare con un target global o específico si es necesario
            setTimeout(() => {
              Swal.fire({
                title: isTotalSuccess ? '¡Proceso Completado!' : 'Resultado de la actualización',
                html: htmlContent,
                icon: isTotalSuccess ? 'success' : (profileSuccess || photoSuccess ? 'warning' : 'error'),
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6',
                allowOutsideClick: false,
                backdrop: true,
                // Intentar forzar que se renderice en el body pero con un z-index superior
                target: 'body' 
              }).then(() => {
                if (profileSuccess) {
                  this.refreshProfileCheck();
                }
              });
            }, 150);

          } else if (result === true) {
            this.refreshProfileCheck();
          }
        });





      }
      
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
      let errorMessage = error?.error?.message || error?.error || "Error agregando el tour al carrito. Por favor, intenta de nuevo.";
      
      if (error.status === 409) {
        errorMessage = "Este tour ya existe en tu carrito para esta fecha.";
      } else if (error.status === 500) {
        errorMessage = "Error en el servidor. Por favor, contacta a soporte.";
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#3085d6'
      });
      
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

    if (slot.capacity === 0 || (slot.availability !== undefined && slot.availability === 0)) {
      classes += " full";
    }

    return classes;
  }

  /**
   * Verifica si un slot está lleno
   */
  isSlotFull(slot: SlotDto): boolean {
    return slot.capacity === 0 || (slot.availability !== undefined && slot.availability === 0);
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

  dateErrors: Set<string> = new Set<string>();

  canSelectDate(date: Date): boolean {
    const isGroup = this.selectedTour?.tour?.priceType === 'group';
    const availability = this.getDayAvailability(date);
    if (availability === '∞') return true;
    
    // Validar en base al grupo o total de participantes seleccionado
    if (isGroup) {
      return (availability as number) >= this.groupCount;
    } else {
      return (availability as number) >= this.totalParticipants;
    }
  }

  hasCapacityError(date: Date): boolean {
    return this.dateErrors.has(dayjs(date).format('YYYY-MM-DD'));
  }

  selectDate(date: Date) {
    if (!this.canSelectDate(date)) {
      const dateStr = dayjs(date).format('YYYY-MM-DD');
      this.dateErrors.add(dateStr);
      setTimeout(() => {
        this.dateErrors.delete(dateStr);
      }, 1500); // Reflejar el error en rojo por 1.5s
      return;
    }

    this.selectedDate = date;
    this.resetSelection();
    this.updateAvailableSlots();
  }

  updateAvailableSlots() {
    if (this.selectedTour && this.selectedDate) {
      const selectedDateDayjs = dayjs(this.selectedDate);
      this.availableSlots = this.cartService.convertToSlotsWithPrices(
        this.selectedTour,
        selectedDateDayjs.format("YYYY-MM-DD")
      );

      // Inicializar participantes con el primer slot si no hay selección
      if (this.availableSlots.length > 0 && !this.selectedSlot) {
        this.initOrUpdateParticipants(this.availableSlots[0].prices ?? []);
        this.updateTotals();
        this.updateValidation();
      }
    } else {
      this.availableSlots = [];
      // No limpiar participantes para que la UI se renderice independientemente de la fecha
    }
  }

  private initOrUpdateParticipants(prices: any[], customMaxQuantity?: number) {
    // 1. Guardar selecciones previas, si existen
    const currentQuantities = new Map<string, number>();
    this.participants.forEach(p => {
      currentQuantities.set(p.ageType, p.quantity);
    });

    // 2. Crear nueva lista en base a los precios asignados del slot / default
    this.participants = this.cartService.createParticipantSelections(prices);

    // 3. Restaurar las cantidades seleccionadas previamente a los tipos de tarifa correspondientes
    this.participants.forEach(p => {
      if (currentQuantities.has(p.ageType)) {
        p.quantity = currentQuantities.get(p.ageType)!;
      }
    });

    // 4. Limitar por customMaxQuantity o por comportamiento de grupo
    this.updateParticipantLimits();

    // Si hay un customMaxQuantity manual (fallback), aplicarlo
    if (customMaxQuantity !== undefined) {
      this.participants.forEach(p => {
        p.maxQuantity = customMaxQuantity;
      });
    }

    // Asegurar que las cantidades previas no excedan el nuevo límite
    this.participants.forEach(p => {
      p.quantity = Math.min(p.quantity, p.maxQuantity);
    });

    // 5. Aplicar lógica de predeterminados
    const hasPreviousQuantities = Array.from(currentQuantities.values()).some(q => q > 0);
    if (!hasPreviousQuantities) {
      this.applyDefaultTravellers();
    }
  }

  /**
   * Aplica los valores predeterminados de travellersData a los participantes
   * con lógica distributiva ('inteligencia' o cascada)
   */
  private applyDefaultTravellers(): void {
    if (!this.data.travellersData || this.participants.length === 0) return;

    const td = this.data.travellersData;
    const totalRequested = (td.adults || 0) + (td.children || 0) + (td.infants || 0);

    if (this.participants.length === 1) {
      this.participants[0].quantity = Math.min(totalRequested, this.participants[0].maxQuantity);
    } else {
      let unassignedAdults = td.adults || 0;
      let unassignedChildren = td.children || 0;
      let unassignedInfants = td.infants || 0;

      const pAdult = this.participants.find(p => p.ageType === 'ADULT');
      const pChild = this.participants.find(p => p.ageType === 'CHILD');
      const pInfant = this.participants.find(p => p.ageType === 'INFANT');

      // 1. Asignación directa
      if (pAdult) { pAdult.quantity = unassignedAdults; unassignedAdults = 0; }
      if (pChild) { pChild.quantity = unassignedChildren; unassignedChildren = 0; }
      if (pInfant) { pInfant.quantity = unassignedInfants; unassignedInfants = 0; }

      // 2. Reasignación inteligente si la tarifa específica no existe en el tour
      if (unassignedChildren > 0) {
        if (pInfant) {
          pInfant.quantity += unassignedChildren;
          unassignedChildren = 0;
        } else if (pAdult) {
          pAdult.quantity += unassignedChildren;
          unassignedChildren = 0;
        }
      }

      if (unassignedInfants > 0) {
        if (pChild) {
          pChild.quantity += unassignedInfants;
          unassignedInfants = 0;
        } else if (pAdult) {
          pAdult.quantity += unassignedInfants;
          unassignedInfants = 0;
        }
      }

      if (unassignedAdults > 0) {
        if (pChild) {
          pChild.quantity += unassignedAdults;
        } else if (pInfant) {
          pInfant.quantity += unassignedAdults;
        }
      }

      // Asegurar que no exceda maxQuantity
      this.participants.forEach(p => {
        p.quantity = Math.min(p.quantity, p.maxQuantity);
      });
    }
  }
}
