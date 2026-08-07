import { I18nField } from '../interfaces/i18n-field.interface';
import { TagDto } from './search-tour-response.dto';

export interface Tour {
  id?: number;
  name?: I18nField | string;
  description?: I18nField | string;
  tourCategoryId?: number;
  priceType?: string;
  duration?: string;
  maxPeople?: number;
  highlight?: number;
  price?: number;
  minAge?: number;
  rating?: 0;
  status?: string;
  locations?: Location[];
  mainAttractions?: MainAttraction[];
  includes?: Include[];
  excludes?: Exclude[];
  faq?: FAQ[];
  itineraries?: Itinerary[];
  cancellationPolicies?: CancellationPolicy[];
  tourCategory?: TourCategory;
  provider?: Provider;
  profilePicture?: Gallery;
  galleries?: Gallery[];
  tags?: TagDto[];
  subCategory?: string;
  isUnlimitedCapacity?: boolean;
  durationEnum?: string | string[];
  timeOfDay?: string | string[];
}

export interface TourDetail {
  id: number;
  name: string;
  description: string;
  tourCategoryId: number;
  priceType: string;
  duration: string;
  maxPeople: number;
  highlight: number;
  price: number;
  minAge: number;
  meetingPoint?: string | any;
  rating: 0;
  status: string;
  locations: Location[];
  mainAttractions: MainAttraction[];
  includes: Include[];
  excludes: Exclude[];
  faq: FAQ[];
  itineraries: Itinerary[];
  cancellationPolicies: CancellationPolicy[];
  tourCategory: TourCategory;
  provider: Provider;
  profilePicture: Gallery;
  galleries: Gallery[];
  durationEnum?: string;
}

export interface TourCategory {
  id?: number;
  name: string;
  description: string;
}

interface Provider {
  id?: number;
  name: string;
  documentNumber: string;
  documentType: string;
  serviceType: string;
  country: {
      id: number,
      name: string
    },
  city: {
    id: number,
    name: string
  },
  state: {
    id: number,
    name: string
  },
  department: string;
  address: string;
  status: string;
  email: string;
  profilePicture: Gallery;
  phone: string;
}

interface Location {
  id?: number;
  address: string;
  location: I18nField | string;
  addressType: string;
  countryId: number;
  stateId: number;
  cityId: number;
  // TC-016 (#219): backend expone nombres directos junto a los IDs.
  countryName?: string;
  stateName?: string;
  cityName?: string;
  latitude: number;
  longitude: number;
}

interface MainAttraction {
  id?: number;
  description: I18nField | string;
}

interface Include {
  id?: number;
  description: I18nField | string;
  type: string;
}

interface Exclude {
  id?: number;
  description: I18nField | string;
  type: string;
}

interface FAQ {
  id?: number;
  question: I18nField | string;
  answer: I18nField | string;
}

interface Itinerary {
  id?: number;
  title: I18nField | string;
  day: number;
  time: string;
  description: I18nField | string;
}

interface CancellationPolicy {
  id?: number;
  observations: I18nField | string;
  allowsRainRefund: boolean;
  allowsRescheduling: boolean;
  cancellationPolicyType: string;
}

export interface Gallery {
  id?: number;
  imageUrl: string;
  description: I18nField | string;
  orderIndex: number;
}
