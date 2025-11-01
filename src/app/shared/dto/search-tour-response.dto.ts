export interface SearchTourListDto {
  providerStateId: number;
  providerCityId: number;
  categoryId: number;
  page: number;
  size: number;
  startDate: string;
  endDate: string;
  duration: string;
  ageType: string;
  minPrice: number;
  maxPrice: number;
  durationType: string;
  sort_by?: string;
  sort_dir?: string;
  tourId?: number;
  tag: string;
  textSearch:string;
}

export interface ScheduleDto {
  id: number;
  tourId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  reservedCapacity: number;
  isUnlimitedCapacity: boolean;
  status: string;
  config?: ConfigDto;
}
export interface TourDto {
  id: number;
  name: string;
  description: string;
  duration: number;
  durationType: string;
  rating: number;
  status: string;
  tags: TagDto[];
  address: AddressDto;
  gallery: GalleryDto[];
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

export interface TagDto {
  id: number;
  name: string;
  category: string;
}

export interface PriceDto {
  ageType: string;
  minAge: number;
  maxAge: number;
  price: number;
}

export interface ConfigDto {
  id: number;
  slots: SlotDto[];
}

export interface SlotDto {
  slotId: number;
  startTime: string;
  endTime: string;
  minCapacity: number;
  maxCapacity: number;
  prices: PriceDto[];
}

export interface TourScheduleResponseDto {
  tour: TourDto;
  schedules: ScheduleDto[];
}
