export interface PendingReviewResponse {
  meta: Meta;
  data: Data;
}

export interface Meta {
  messageUid: string;
  requestDt: string;
}

export interface Data {
  reviewPendingBookings: ReviewPendingBooking[];
}

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
