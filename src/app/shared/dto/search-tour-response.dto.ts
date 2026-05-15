export interface SearchTourListDto {
  categoryIds?: number[];
  subCategories?: string[];
  durationEnums?: string[];
  timeOfDay?: string[];
  tagIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  language?: string;
  textSearch?: string;
  
  // Legacy fields (might be used for mapping or external references)
  providerStateId?: number;
  providerCityId?: number;
  categoryId?: number | string;
  page?: number;
  size?: number;
  duration?: string;
  ageType?: string;
  durationType?: string;
  sort_by?: string;
  sort_dir?: string;
  tourId?: number;
  tag?: string;
}

export interface ScheduleDto {
  id: number;
  tourId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reservedCapacity: number;
  isUnlimitedCapacity: boolean;
  status: string;
  availability?: number;
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
  priceType?: string;
  maxPeople?: number;
  subCategory?: string;
  subCategoryName?: string;
  priceFrom?: number;
  profilePicture?: { imageUrl: string };
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
  capacity: number;
  availability?: number;
  prices: PriceDto[];
}

export interface TourScheduleResponseDto {
  tour: TourDto;
  schedules: ScheduleDto[];
}
