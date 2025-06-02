import { TypeOfAddress } from "../enums/type-of-address.enum";

export interface CreateTourDto {
  name: string;
  description: string;
  tourCategoryId: number;
  duration: string;
  maxPeople: number;
  highlight: number;
  locations: Location[];
  mainAttractions: MainAttraction[];
  includes: Include[];
  excludes: Exclude[];
  faq: Faq[];
}

export interface Location {
  countryId: number;
  stateId: number;
  cityId: number;
  latitude: 0.1;
  longitude: 0.1;
  address: string;
  addressType: TypeOfAddress;
}

export interface MainAttraction {
  description: string;
}

export interface Include {
  description: string;
  type: "Include";
}

export interface Exclude {
  description: string;
  type: "Exclude";
}

export interface Faq {
  question: string;
  answer: string;
}
