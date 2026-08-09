import { Gallery } from "./tour-response.dto";

export interface TourAdminDto {
  id: number;
  name: string;
  description: string;
  duration: string;
  maxPeople: number;
  highlight: number;
  price: number | null;
  porcentajeTourya?: number | null;
  minAge: number;
  rating: number | null;
  status: TourStatus;
  tourCategoryId: number;
  // TC-015 refinamiento (#218): columnas adicionales en la lista Gestion de Tours (admin).
  subCategory?: string;
  priceType?: string;
  // opcionalmente puede venir el objeto de categoría embebido
  tourCategory?: TourCategoryDto;
  provider: ProviderDto;
  // Arrays adicionales según respuesta de detalle
  locations?: LocationDto[];
  mainAttractions?: MainAttractionDto[];
  includes?: IncludeDto[];
  excludes?: ExcludeDto[];
  faq?: FaqDto[];
  itineraries?: ItineraryDto[];
  cancellationPolicies?: CancellationPolicyDto[];
  profilePicture: Gallery;

  galleries: Gallery[];
}

export interface TourCategoryDto {
  id: number;
  name: string;
  description: string;
}

export interface ProviderDto {
  id: number;
  name: string;
  documentNumber: string;
  documentType: string;
  serviceType: string;
  country: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
  };
  department: string;
  address: string;
  phone: string;
  status: string;
  email: string;
  profilePicture: Gallery;
}

export interface LocationDto {
  id?: number;
  address: string;
  location: string;
  addressType: string;
  countryId: number;
  stateId: number;
  cityId: number;
  // TC-016 (#219): backend expone nombres directos junto a los IDs.
  countryName?: string;
  stateName?: string;
  cityName?: string;
  latitude?: number;
  longitude?: number;
}

export interface MainAttractionDto {
  id?: number;
  description: string;
}

export interface IncludeDto {
  id?: number;
  description: string;
  type?: string;
}

export interface ExcludeDto {
  id?: number;
  description: string;
  type?: string;
}

export interface FaqDto {
  id?: number;
  question: string;
  answer: string;
}

export interface ItineraryDto {
  id?: number;
  title: string;
  day?: number;
  time?: string;
  description?: string;
}

export interface CancellationPolicyDto {
  id?: number;
  observations?: string;
  allowsRainRefund?: boolean;
  allowsRescheduling?: boolean;
  cancellationPolicyType?: string;
}

export type TourStatus = 'created' | 'submitted' | 'returned' | 'accepted' | 'cancelled';

export interface TourAdminListResponse {
  content: TourAdminDto[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
