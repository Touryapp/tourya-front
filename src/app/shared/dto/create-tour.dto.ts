import { TypeOfAddress } from "../enums/type-of-address.enum";

export interface CreateTourDto {
  id?: number;
  name: string;
  description: string;
  tourCategoryId: number;
  duration: string;
  maxPeople: number;
  locations: Location[];
  mainAttractions: MainAttraction[];
  includes: Include[];
  excludes: Exclude[];
  faq: Faq[];
}

export interface Location {
  id?: number;
  countryId: number;
  stateId: number;
  cityId: number;
  latitude: 0.1;
  longitude: 0.1;
  address: string;
  addressType: TypeOfAddress;
}

export interface MainAttraction {
  id?: number;
  description: string;
}

export interface Include {
  id?: number;
  description: string;
  type: "Include";
}

export interface Exclude {
  id?: number;
  description: string;
  type: "Exclude";
}

export interface Faq {
  id?: number;
  question: string;
  answer: string;
}
