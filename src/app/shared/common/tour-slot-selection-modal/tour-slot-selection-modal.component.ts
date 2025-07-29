import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchToursDto } from '../../dto/search-tours.dto';
import { CartItem, SlotWithPrices, ParticipantSelection } from '../../dto/cart.dto';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-tour-slot-selection-modal',
  standalone: false,
  templateUrl: './tour-slot-selection-modal.component.html',
  styleUrls: ['./tour-slot-selection-modal.component.scss']
})
export class TourSlotSelectionModalComponent implements OnInit {
  @Output() tourAdded = new EventEmitter<CartItem>();
  @Output() modalClosed = new EventEmitter<void>();

  // Modal state
  showModal: boolean = false;

  // Tour data
  selectedTour: SearchToursDto | null = null;
  selectedDay: string = '';
  availableSlots: SlotWithPrices[] = [];
  selectedSlot: SlotWithPrices | null = null;
  participants: ParticipantSelection[] = [];

  // Validation
  isValid: boolean = false;
  validationErrors: string[] = [];
  totalParticipants: number = 0;
  totalPrice: number = 0;

  constructor(
    private cartService: CartService
  ) {}

  ngOnInit(): void {}

  /**
   * Abre el modal para seleccionar slot
   */
  openModal(tour: SearchToursDto, dayDate: string): void {
    this.selectedTour = tour;
    this.selectedDay = dayDate;
    this.availableSlots = this.cartService.convertToSlotsWithPrices(tour);
    this.resetSelection();
    this.showModal = true;
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.showModal = false;
    this.resetSelection();
    this.modalClosed.emit();
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
   * Selecciona un slot
   */
  selectSlot(slot: SlotWithPrices): void {
    this.selectedSlot = slot;
    this.participants = this.cartService.createParticipantSelections(slot.prices);
    this.updateValidation();
  }

  /**
   * Actualiza la cantidad de participantes
   */
  updateParticipantQuantity(participant: ParticipantSelection, quantity: number): void {
    participant.quantity = Math.max(0, Math.min(quantity, participant.maxQuantity));
    this.updateTotals();
    this.updateValidation();
  }

  /**
   * Incrementa la cantidad de participantes
   */
  incrementParticipant(participant: ParticipantSelection): void {
    if (participant.quantity < participant.maxQuantity && this.canAddParticipant()) {
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
    this.totalParticipants = this.participants.reduce((sum, p) => sum + p.quantity, 0);
    this.totalPrice = this.cartService.calculateTotalPrice(this.participants);
  }

  /**
   * Actualiza la validación
   */
  private updateValidation(): void {
    this.validationErrors = [];

    if (!this.selectedSlot) {
      this.validationErrors.push('Debe seleccionar un horario');
      this.isValid = false;
      return;
    }

    if (this.totalParticipants === 0) {
      this.validationErrors.push('Debe agregar al menos un participante');
      this.isValid = false;
      return;
    }

    if (this.totalParticipants < this.selectedSlot.minCapacity) {
      this.validationErrors.push(`Mínimo ${this.selectedSlot.minCapacity} participantes requeridos`);
      this.isValid = false;
      return;
    }

    if (this.totalParticipants > this.selectedSlot.maxCapacity) {
      this.validationErrors.push(`Máximo ${this.selectedSlot.maxCapacity} participantes permitidos`);
      this.isValid = false;
      return;
    }

    this.isValid = true;
  }

  /**
   * Confirma la selección y agrega al carrito
   */
  confirmSelection(): void {
    if (!this.isValid || !this.selectedTour || !this.selectedSlot) {
      return;
    }

    const cartItem: CartItem = {
      id: this.cartService.generateCartItemId(),
      dayDate: this.selectedDay,
      tour: this.selectedTour.tour,
      schedule: this.selectedTour.schedule,
      selectedSlot: {
        slotId: this.selectedSlot.slotId,
        startTime: this.selectedSlot.startTime,
        endTime: this.selectedSlot.endTime,
        minCapacity: this.selectedSlot.minCapacity,
        maxCapacity: this.selectedSlot.maxCapacity
      },
      participants: this.participants
        .filter(p => p.quantity > 0)
        .map(p => ({
          ageType: p.ageType,
          quantity: p.quantity,
          price: p.price
        })),
      totalPrice: this.totalPrice,
      totalParticipants: this.totalParticipants,
      address: this.selectedTour.address,
      gallery: this.selectedTour.gallery
    };

    this.cartService.addItemToCart(cartItem);
    this.tourAdded.emit(cartItem);
    this.closeModal();
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
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
  getSlotClass(slot: SlotWithPrices): string {
    let classes = 'slot-item';
    
    if (this.selectedSlot?.slotId === slot.slotId) {
      classes += ' selected';
    }
    
    if (slot.availableCapacity === 0) {
      classes += ' full';
    }
    
    return classes;
  }

  /**
   * Verifica si un slot está lleno
   */
  isSlotFull(slot: SlotWithPrices): boolean {
    return slot.availableCapacity === 0;
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
    return participant.quantity < participant.maxQuantity && this.canAddParticipant();
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
    return this.selectedTour?.tour?.name || '';
  }

  /**
   * Obtiene la primera imagen del tour de manera segura
   */
  getTourImage(): string {
    if (this.selectedTour?.gallery && this.selectedTour.gallery.length > 0) {
      return this.selectedTour.gallery[0]?.imageUrl || '';
    }
    return '';
  }

  /**
   * Verifica si hay imágenes disponibles
   */
  hasImages(): boolean {
    return !!(this.selectedTour?.gallery && this.selectedTour.gallery.length > 0);
  }

  /**
   * Obtiene la ubicación del tour de manera segura
   */
  getTourLocation(): string {
    const city = this.selectedTour?.address?.city || '';
    const state = this.selectedTour?.address?.state || '';
    return city && state ? `${city}, ${state}` : city || state || '';
  }

  /**
   * Obtiene la duración del tour de manera segura
   */
  getTourDuration(): string {
    return this.selectedTour?.tour?.duration || '';
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
    return !!(this.selectedTour?.tour?.rating);
  }

  /**
   * Obtiene la descripción del tour de manera segura
   */
  getTourDescription(): string {
    return this.selectedTour?.tour?.description || '';
  }
} 