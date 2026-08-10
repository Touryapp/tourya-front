import { TypeOfPerson } from "../enums/type-of-person.enum";

// TC-019 (#231): subCategory (opcional) para templates. Se usa desde template-form.
export interface CreateTourScheduleTemplate {
  tourId?: number;
  label: string;
  daysOfWeek: string[];
  slots: any[];
  isTemplate: boolean;
  createdBy?: number;
  providerId?: number;
  subCategory?: string;
}

export interface CreateTourSchedule {
  tourId: number;
  label: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];

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
  providerPrice: number;
}
