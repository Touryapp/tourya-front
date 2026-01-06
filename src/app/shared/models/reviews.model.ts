
export interface ReviewPendingBooking {
  img: string;
  id: string;
  hotel: string;
  room: string;
  location: string;
  guest: string;
  days: string;
  pricing: string;
  bookedOn: string;
  status: string;
}

export interface ProviderReviewAsk {
  comment: string;
  providerName: string;
  providerImage: string;
  date: string;
  daysAgo: string;
  likes: number;
  dislikes: number;
  hearts: number;
  attachmentUrls?: string[]; // URLs of answer images
}

export interface ServiceResponsible {
  name: string;
  email: string;
  phone: number;
}

export interface ProviderReview {
  reservationId: number;
  paymentId: number;
  itemId: number;
  qrUrl: string;
  reservationDate: string;
  deliveryStatus?: string;
  serviceResponsible?: ServiceResponsible;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: number;
  lastModifiedBy: number;
  tourId: number | null;
  tourName: string | null;
  tourType: string | null;
  duration: string | null;
  checkInDate: string | null;
  returnDate: string | null;
  destination: string | null;
  price: number | null;
  travellers: number | null;
  activities: string | null;
  extraServices: string | null;
  payer: string | null;
  // Legacy fields for reviews (when they exist)
  id?: string;
  tourImage?: string;
  customerName?: string;
  customerImage?: string;
  rating?: number;
  comment?: string;
  date?: string;
  daysAgo?: string;
  likes?: number;
  dislikes?: number;
  hearts?: number;
  status?: string;
  answer?: ProviderReviewAsk;
  attachmentUrls?: string[]; // URLs of review images
}

export interface ReviewsApiResponse {
  content: ProviderReview[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Estructura para comentarios multilingües
 */
export interface MultilingualComment {
  es: string;
  en: string;
  pt: string;
}

/**
 * Request para crear una nueva review con comentarios multilingües
 */
export interface CreateReviewRequest {
  reservationId: number;
  rating: number;
  comment: MultilingualComment;
  date: string;
}

/**
 * Request simplificado para crear una review (el servicio maneja la internacionalización)
 */
export interface CreateReviewSimpleRequest {
  reservationId: number;
  rating: number;
  comment: string;
}

/**
 * Estructura para la respuesta del proveedor a una review
 */
export interface ProviderAnswerRequest {
  comment: MultilingualComment;
  providerName: string;
  providerImage: string;
  date: string;
  daysAgo?: string;
  likes?: number;
  dislikes?: number;
  hearts?: number;
}

/**
 * Request completo para actualizar una review con la respuesta del proveedor
 */
export interface UpdateReviewWithAnswerRequest {
  rating?: number;
  comment?: MultilingualComment;
  likes?: number;
  dislikes?: number;
  hearts?: number;
  status?: string;
  rejectionReason?: string;
  answer: ProviderAnswerRequest;
}
