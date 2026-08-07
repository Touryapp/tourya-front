/**
 * Interfaz para la respuesta de reserva (legacy - para proveedores)
 * @deprecated Use ClientReservation instead
 */
export interface Reservation {
  id: number;
  reservationId: string;
  paymentId: number;
  transactionId: string;
  payer: string;
  email: string;
  reservationDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  tourId?: number;
  tourName?: string;
  tourType?: string;
  price?: number;
  travellers?: string;
  duration?: string;
  checkInDate?: string;
  returnDate?: string;
  destination?: string;
  customerPhone?: string;
  extraServices?: string[];
  activities?: string[];
}

/**
 * Interfaz para reservas de clientes (coincide con el API real)
 */
export interface ClientReservation {
  reservationId: number;
  reservationDate: string;
  reservationDeliveryStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED' | 'CANCELED';
  reservationCreatedDate: string;
  paymentId: number;
  paymentTransactionId: string;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  payerDocumentType: string;
  payerDocumentNumber: string;
  shoppingItemId: number;
  shoppingTotalPrice: number;
  providerPrice?: number;
  shoppingUnitPrice: number;
  shoppingQuantity: number;
  productType: string;
  productId: number;
  totalTourists: number;
  tourId: number;
  tourName: string;
  tourCategoryId: number;
  tourProviderId: number;
  tourScheduleId: number;
  scheduleDate: string;
  slotId: number;
  slotTimeStart: string;
  slotTimeEnd: string;
  minCapacity: number;
  capacity: number;
  serviceResponsibleName: string;
  serviceResponsibleEmail: string;
  serviceResponsiblePhone: string;
  maxCancellationDate?: string; // ISO date string - maximum date for cancellation
  maxReschedulingDate?: string; // ISO date string - maximum date for rescheduling
  canReschedule?: boolean; // New field from API
  canCancel?: boolean; // New field from API
  canConfirmReservation?: boolean;
  canRainCancel?: boolean;
  customerProfileImageUrl?: string;
  /** TC-005 refinamientos (#188): nombre del proveedor (provider.name). Solo se usa en admin ADMIN. */
  providerName?: string;
  /** TC-005 refinamientos (#188): imagen principal del tour desde tour_gallery (primera por order_index). */
  tourImageUrl?: string;
  /** TC-016 (#219): desglose de viajeros por ageType (ADULT/CHILD/INFANT). Puede ser [] para reservas historicas. */
  travelerBreakdown?: TravelerBreakdown[];
}

/**
 * TC-016 (#219): item del desglose de viajeros por ageType dentro de una reserva.
 */
export interface TravelerBreakdown {
  ageType: string;
  quantity: number;
  unitPrice?: number;
  providerUnitPrice?: number;
}

/**
 * Interfaz para la respuesta paginada
 */
export interface PaginatedResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Interfaz para la respuesta de consumir una reserva
 */
export interface ConsumeReservationResponse {
  reservationId: number;
  paymentId: number;
  itemId: number;
  qrUrl: string;
  reservationDate: string;
  deliveryStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED';
  serviceResponsible: {
    name: string;
    email: string;
    phone: number;
  };
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
}

/**
 * Interfaz para los detalles de una reserva (GET /api/v1/reservations/{id})
 */
export interface ReservationDetails {
  reservationId: number;
  paymentId: number;
  itemId: number;
  qrUrl: string;
  reservationDate: string;
  deliveryStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED';
  serviceResponsible: {
    name: string;
    email: string;
    phone: number;
  };
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
  tourId: number;
  tourName: string;
  tourType: string;
  duration: string | null;
  checkInDate: string;
  returnDate: string | null;
  destination: string;
  price: number;
  travellers: string;
  activities: string[];
  extraServices: string[];
  maxCancellationDate?: string;
  maxReschedulingDate?: string;
  cancellationDate?: string | null;
  cancellationReason?: string | null;
  canReschedule?: boolean;
  canCancel?: boolean;
  canConfirmReservation?: boolean;
  canRainCancel?: boolean;
  credit?: any;
  payer?: {
    name: string;
    email: string;
    phone: string;
  };
  // List API payer fields (may come from reservation list)
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  payerDocumentType?: string;
  payerDocumentNumber?: string;
}

/**
 * Interfaz para la solicitud de reagendamiento de una reserva
 */
export interface RescheduleReservationRequest {
  newDate: string;
  slotId: number;
  startTime: string;
  endTime: string;
  configQuantity: {
    ageType: string;
    quantity: number;
  }[];
  groupCount?: number;
}
