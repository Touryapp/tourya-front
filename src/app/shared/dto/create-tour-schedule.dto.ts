import { TypeOfPerson } from "../enums/type-of-person.enum";

export interface CreateTourSchedule {
  tourId: number;
  label: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  isUnlimitedCapacity: boolean;
  slots: CreateTourScheduleSlot[];
  isTemplate: boolean;
  createdBy: number;
}

export interface CreateTourScheduleSlot {
  id?: number;
  startTime: string;
  endTime: string;
  capacity: number;
  prices: CreateTourSchedulePrice[];
}

export interface CreateTourSchedulePrice {
  id?: number;
  ageType: TypeOfPerson;
  minAge: number;
  maxAge: number;
  price: number;
}
