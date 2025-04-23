import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarBookingRoutingModule } from './car-booking-routing.module';
import { CarBookingComponent } from './car-booking.component';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    CarBookingComponent
  ],
  imports: [
    CommonModule,
    CarBookingRoutingModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class CarBookingModule { }
