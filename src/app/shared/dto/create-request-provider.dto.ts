export interface CreateRequestProviderDto {
    name: string;
    documentNumber: string;
    documentType: string;
    serviceType: string;
    countryId: number;
    stateId: number;
    cityId: number;
    department: string;
    address: string;
    phone: string;
  }