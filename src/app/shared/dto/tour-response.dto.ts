export interface Tour {
  id?: number;
  name?: string;
  description?: string;
  tourCategoryId?: number;
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
}

export interface TourDetail {
  id: number;
  name: string;
  description: string;
  tourCategoryId: number;
  duration: string;
  maxPeople: number;
  highlight: number;
  price: number;
  minAge: number;
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
  location: string;
  addressType: string;
  countryId: number;
  stateId: number;
  cityId: number;
  latitude: number;
  longitude: number;
}

interface MainAttraction {
  id?: number;
  description: string;
}

interface Include {
  id?: number;
  description: string;
  type: string;
}

interface Exclude {
  id?: number;
  description: string;
  type: string;
}

interface FAQ {
  id?: number;
  question: string;
  answer: string;
}

interface Itinerary {
  id?: number;
  title: string;
  day: number;
  time: string;
  description: string;
}

interface CancellationPolicy {
  id?: number;
  observations: string;
  allowsRainRefund: boolean;
  allowsRescheduling: boolean;
  cancellationPolicyType: string;
}

export interface Gallery {
  id?: number;
  imageUrl: string;
  description: string;
  orderIndex: number;
}
