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
  transactionData: string; // Todo el objeto de Wompi como JSON string
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

// Payment Response DTO
export interface PaymentResponseDto {
  paymentId: number;
  transactionId: string;
  transactionData: string;
  reservation: ReservationDto;
  payer: PayerDto;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
}

export interface ReservationDto {
  reservationId: number;
  paymentId: number;
  qrUrl: string; // QR code como imagen
  reservationDate: string;
  deliveryStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED';
  createdDate: string;
  items: ReservationItemDto[];
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
}

export interface ReservationItemDto {
  shoppingCartItemId: number;
  serviceResponsible: ServiceResponsibleDto;
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