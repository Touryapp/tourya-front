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
    public dialogRef: MatDialogRef<TourSlotSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      tour: TourScheduleResponseDto;
      dayDate: string;
      checkIn: string;
      checkOut: string;
      tourAdded: (cartItem: CartItem) => void;
    }
  ) {
    this.selectedTour = data.tour;
    this.selectedDay = data.dayDate;
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
   * Confirma la selección y agrega al carrito
   */
  async confirmSelection(): Promise<void> {
    if (!this.isValid || !this.selectedTour || !this.selectedSlot) {
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
      
      // Mostrar mensaje de error al usuario
      let errorMessage = "Error agregando el tour al carrito. Por favor, intenta de nuevo.";
      
      if (error.status === 401) {
        errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      } else if (error.status === 400) {
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
   * Formatea el tiempo
   */
  formatTime(time: string): string {
    return time.substring(0, 5); // HH:MM
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
    return this.selectedTour?.tour?.name || "";
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
    return this.selectedTour?.tour?.description || "";
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
