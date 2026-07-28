export interface TouristProfileDto {
  id?: number;
  userId?: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  photoUrl?: string;
}

export interface AddressCompleteResponseDto {
  addressComplete: boolean;
}
