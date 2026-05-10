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
