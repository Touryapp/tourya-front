import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotelBookingRoutingModule } from './hotel-booking-routing.module';
import { HotelBookingComponent } from './hotel-booking.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    HotelBookingComponent
  ],
  imports: [
    CommonModule,
    HotelBookingRoutingModule,
    SharedModule
  ]
})
export class HotelBookingModule { }
