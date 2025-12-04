
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
}

export interface ProviderReview {
  id: string;
  tourName: string;
  tourId: string;
  tourImage: string;
  customerName: string;
  customerImage: string;
  rating: number;
  comment: string;
  date: string;
  daysAgo: string;
  likes: number;
  dislikes: number;
  hearts: number;
  bookingId: string;
  status?: string;
  answer?: ProviderReviewAsk;
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
