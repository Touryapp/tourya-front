export interface Tour {
  id?: number;
  name?: string;
  description?: string;
  duration?: string;
  maxPeople?: number;
  highlight?: boolean;
  tourCategory?: TourCategory;
  tourCategoryId?: number;
  locations?: Location[];
  provider?: Provider;
}

interface TourCategory {
  id?: number;
  name?: string;
  description?: string;
}

interface Provider {
  id?: number;
  nombre?: string;
  numeroDocumento?: string;
  tipoDocumento?: string;
  tipoServicio?: string;
  pais?: string;
  departamento?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  status?: string;
}

interface Location {
  id?: number;
  address?: string;
  addressType?: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  latitude?: number;
  longitude?: number;
}
