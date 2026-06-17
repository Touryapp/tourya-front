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
  amountCredit: number | null;
  creditsUsed: Array<{ creditId: number; amountUsed: number }> | null;
  reservations: ReservationDto[];
  payer: PayerDto;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
  totalAmount?: number;
  appliedCredits?: number;
}

export interface ReservationDto {
  reservationId: number;
  bookingId: string;
  paymentId: number;
  itemId: number;
  qrUrl: string;
  reservationDate: string;
  deliveryStatus: DeliveryStatus;
  serviceResponsible: ServiceResponsibleDto;
  tourOperator: {
    providerUserId: number;
    name: string;
    email: string;
    phone: string | number;
  };
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
  
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  payerDocumentType: string;
  payerDocumentNumber: string;
  
  tourId: number;
  tourName: string;
  tourImageUrl: string;
  tourType: string;
  duration: string | null;
  checkInDate: string;
  returnDate: string | null;
  destination: string;
  price: number;
  providerTotalAmount: number;
  priceBreakdown: Array<{
    ageType: string;
    quantity: number;
    unitPrice: number;
    providerUnitPrice: number;
    subtotal: number;
    providerSubtotal: number;
  }>;
  travellers: string;
  activities: string[];
  extraServices: string[];
  maxCancellationDate: string;
  maxReschedulingDate: string;
  cancellationReason: string | null;
  cancellationDate: string | null;
  credit: any | null;
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
  providerTotalAmount?: number;
  creationDate: string;
  lastModifiedDate: string | null;
  accommodationName: string | null;
  accommodationLatitude: number | null;
  accommodationLongitude: number | null;
  originCountryId: number | null;
  originStateId: number | null;
  originCityId: number | null;
  electronicBilling: boolean;
  billingDocumentType: string | null;
  billingDocumentNumber: string | null;
  billingEmail: string | null;
  billingCustomerName: string | null;
  billingPhone: string | null;
}

export interface ShoppingCartItemDto {
  id: number;
  productId: number;
  productType: string;
  serviceId?: number | null;
  serviceName?: string | null;
  serviceType?: string | null;
  productName?: string;
  scheduleDate: string;
  tourScheduleId: number;
  tourName: string;
  slotId: number | null;
  profilePicture?: {
    id: number;
    imageUrl: string;
    description: any;
    orderIndex: number;
  } | null;
  totalPrice: number;
  providerTotalPrice?: number;
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