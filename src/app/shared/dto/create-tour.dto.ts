import { I18nField } from '../interfaces/i18n-field.interface';

export interface CreateTourDto {
  id?: number;
  name: I18nField;
  description: I18nField;
  tourCategoryId: number;
  priceType?: string;
  duration?: string;
  durationEnum?: string;
  maxPeople: number;
  isUnlimitedCapacity?: boolean;
  subCategory?: string;
  timeOfDay?: string[];
  minAge: number;
  locations: CreateLocationDto[];
  mainAttractions: CreateMainAttractionDto[];
  includes: CreateIncludeDto[];
  excludes: CreateExcludeDto[];
  faq: CreateFaqDto[];
  itineraries: CreateItineraryDto[];
  cancellationPolicies: CreateCancellationPolicyDto[];
  modifiedArrayList?: {
    updatedLocations: boolean;
    updatedMainAttractions: boolean;
    updatedIncludes: boolean;
    updatedExcludes: boolean;
    updatedItineraries: boolean;
    updatedFaq: boolean;
    updatedCancellationPolicies: boolean;
  };
}

export interface CreateLocationDto {
  id?: number;
  countryId: number;
  stateId: number;
  cityId: number;
  latitude: number;
  longitude: number;
  address: string;
  location: I18nField;
  addressType: string;
}

export interface CreateMainAttractionDto {
  id?: number;
  description: I18nField;
}

export interface CreateIncludeDto {
  id?: number;
  description: I18nField;
  type: string;
}

export interface CreateExcludeDto {
  id?: number;
  description: I18nField;
  type: string;
}

export interface CreateFaqDto {
  id?: number;
  question: I18nField;
  answer: I18nField;
}

export interface CreateItineraryDto {
  id?: number;
  title: I18nField;
  day: number;
  time: string;
  description: I18nField;
}

export interface CreateCancellationPolicyDto {
  id?: number;
  observations: I18nField;
  allowsRainRefund: boolean;
  allowsRescheduling: boolean;
  cancellationPolicyType: string;
}
