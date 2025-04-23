import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightBookingRoutingModule } from './flight-booking-routing.module';
import { FlightBookingComponent } from './flight-booking.component';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';


@NgModule({
  declarations: [
    FlightBookingComponent
  ],
  imports: [
    CommonModule,
    FlightBookingRoutingModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class FlightBookingModule { }
