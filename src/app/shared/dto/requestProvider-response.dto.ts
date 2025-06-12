export interface RequestProvider {
    id: number;
    status: string;
    provider: Provider;
  }
  export interface Country {
    id: number;
    name: string;
  }
  export interface City {
    id: number;
    name: string;
  }
  export interface State {
    id: number;
    name: string;
  }
  export interface Provider {
    id: number;
    name: string;
    documentNumber: string;
    documentType: string;
    serviceType: string;
    country: Country;
    city: City;
    state: State;
    department: string;
    address: string;
    phone: string;
    status: string;
  }