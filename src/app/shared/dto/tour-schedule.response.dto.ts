import { TypeOfPerson } from "../enums/type-of-person.enum";

export interface TourSchedule {
  id?: number;
  tourId: number;
  label: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  isUnlimitedCapacity: boolean;
  slots: TourScheduleSlot[];
}

export interface TourScheduleSlot {
  id?: number;
  startTime: string;
  endTime: string;
  minCapacity: number;
  maxCapacity: number;
  prices: TourSchedulePrice[];
}

export interface TourSchedulePrice {
  id?: number;
  ageType: TypeOfPerson | { name: string };
  minAge: number;
  maxAge: number;
  price: number;
}

export interface TourScheduleConfigResponseDto {
  "id": number,
  "tourId": number,
  "scheduleDate": string,
  "maxCapacity": number,
  "reservedCapacity": number,
  "isUnlimitedCapacity": boolean,
  "status": string,
  "configId": number,
  "config": TourScheduleConfigDto
}
export interface TourScheduleConfigDto {
  "id": number,
  "providerId": number,
  "label": string,
  "daysOfWeek": string[],
  "isUnlimitedCapacity": boolean,
  "slots": TourScheduleSlot[]
}
