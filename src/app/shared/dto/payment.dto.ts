// Reference Generation Response DTO (from backend)
export interface ReferenceGenerationResponseDto {
  reference: string;
  amount_in_cents: string;
  currency: string;
  sha256_hash: string;
}

// Payment Request DTO
export interface PaymentRequestDto {
  transactionId: string;
  transactionData?: string | null; // Todo el objeto de Wompi como JSON string, o null si es 100% crédito
  reservationIds: number[]; // ✨ Nuevo campo requerido
  paymentType: 'PLATFORM' | 'CREDIT' | 'CREDIT_AND_PLATFORM'; // ✨ Nuevo campo
  amountCredit?: number; // ✨ Nuevo campo
  amountPlatform?: number; // ✨ Nuevo campo
  creditData?: {
    creditIds: number[];
  }; // ✨ Nuevo campo
  items: PaymentItemDto[];
  payer: PayerDto;
}

export interface PaymentItemDto {
  shoppingCartItemId: number;
  serviceResponsible: ServiceResponsibleDto;
}

export interface ServiceResponsibleDto {
  name: string;
  email: string;
  phone: string;
}

export interface PayerDto {
  name: string;
  email: string;
  id: number;
  phone: string;
  documentType: string;
  documentNumber: string;
}

// Payment Response DTO (Nueva estructura)
export interface PaymentResponseDto {
  paymentId: number;
  transactionId: string;
  transactionData: string;
  reservations: ReservationDto[]; // ✨ Ahora es un array de reservas
  payer: PayerDto;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
  totalAmount?: number; // ✨ Total original antes de créditos
  appliedCredits?: number; // ✨ Valor de créditos aplicados
}

export interface ReservationDto {
  reservationId: number;
  paymentId: number;
  itemId: number; // ✨ ID del item del carrito
  qrUrl: string; // ✨ QR code único por reserva
  reservationDate: string;
  deliveryStatus: DeliveryStatus; // ✨ Enum tipado
  serviceResponsible: ServiceResponsibleDto; // ✨ Responsable del servicio
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
}

// ✨ Enum para estados de entrega
export enum DeliveryStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Wompi Response (para referencia)
export interface WompiResponseDto {
  id: string;
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method_type: string;
  status: string;
  created_at: string;
  finalized_at?: string;
  payment_method?: {
    type: string;
    extra: any;
  };
  // Agregar otros campos según respuesta real de Wompi
  [key: string]: any; // Para campos adicionales
}

// Shopping Cart Response DTO (para el GET)
export interface ShoppingCartResponseDto {
  id: number;
  userId: number;
  status: string;
  items: ShoppingCartItemDto[];
  totalAmount: number;
  creationDate: string;
  lastModifiedDate: string | null;
}

export interface ShoppingCartItemDto {
  id: number;
  productId: number;
  productType: string;
  serviceId: number | null;
  serviceName: string | null;
  serviceType: string | null;
  scheduleDate: string;
  tourScheduleId: number;
  tourName: string;
  slotId: number | null;
  totalPrice: number;
  status: string;
  details: ShoppingCartItemDetailDto[];
}

export interface ShoppingCartItemDetailDto {
  id: number;
  ageType: {
    name: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}