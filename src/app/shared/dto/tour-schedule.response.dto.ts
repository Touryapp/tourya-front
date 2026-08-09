import { TypeOfPerson } from "../enums/type-of-person.enum";

export interface TourSchedule {
  id?: number;
  tourId: number;
  label: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];

  slots: TourScheduleSlot[];
}

export interface TourScheduleSlot {
  id?: number;
  startTime: string;
  endTime: string;
  capacity: number;
  prices: TourSchedulePrice[];
}

export interface TourSchedulePrice {
  id?: number;
  ageType: TypeOfPerson | { name: string };
  providerPrice: number;
}

export interface TourScheduleConfigResponseDto {
  "id": number,
  "tourId": number,
  "scheduleDate": string,
  "reservedCapacity": number,

  "status": string,
  "configId": number,
  "config": TourScheduleConfigDto,
  /** TC-018 (#227) Bug B: true si hay alerta DIMAR RED activa para este dia. */
  "blockedByMaritimeReport"?: boolean
}
export interface TourScheduleConfigDto {
  "id": number,
  "providerId": number,
  "label": string,
  "daysOfWeek": string[],

  "slots": TourScheduleSlot[]
}
