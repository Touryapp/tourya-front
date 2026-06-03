export interface PayoutOrderAttachment {
  id: number;
  fileUrl: string;
  createdAt: string;
}

export interface PayoutOrderReservation {
  reservationId: number;
  accountPayableId: number;
  amount: number;
  payoutAvailableDate: string;
  payoutStatus: string;
  // Extra fields for UI mapping
  tourName?: string;
  tourImage?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  checkInDate?: string;
  duration?: string;
  travellers?: string;
  bookingDate?: string;
  scheduleDate?: string;
  slotTimeStart?: string;
  slotTimeEnd?: string;
  totalTourists?: number;
  reservationCreatedDate?: string;
  maxCancellationDate?: string;
  maxReschedulingDate?: string;
  allowsRainRefund?: boolean;
}

export interface PayoutOrder {
  id: number;
  providerId: number;
  createdAt: string;
  payDate: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  amountTotal: number;
  reservationsCount?: number;
  proofUrl?: string;
  attachments?: PayoutOrderAttachment[];
  reservations?: PayoutOrderReservation[];
}

export interface PayoutOrdersResponse {
  orders: PayoutOrder[];
  paidTotal: number;
  pendingTotal: number;
  canceledTotal: number;
  totalIncome: number;
}
