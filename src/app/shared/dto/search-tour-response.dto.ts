export interface SearchTourListDto {
    providerStateId: number,
    providerCityId: number,
    categoryId: number,
    page: number,
    size: number
    startDate: string,
    endDate: string,
    duration: string,
    ageType: string,
    minPrice: number,
    maxPrice: number,
    search: string
}

export interface ScheduleDto {
    id: number;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    maxCapacity: number | null;
    reservedCapacity: number | null;
    isUnlimitedCapacity: boolean | null;
    status: string | null;
}

export interface TourDto {
    id: number;
    name: string;
    description: string;
    duration: string;
    rating: number | null;
}

export interface AddressDto {
    city: string;
    state: string;
    country: string;
    address: string;
}

export interface GalleryDto {
    imageUrl: string;
    description: string;
    order: number;
}

export interface PriceDto {
    ageType: string;
    minAge: number;
    maxAge: number;
    price: number;
}

export interface TourScheduleResponseDto {
    schedule: ScheduleDto;
    tour: TourDto;
    address: AddressDto;
    gallery: GalleryDto[];
    prices: PriceDto[] | null;
}




















































