import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourBookingRoutingModule } from './tour-booking-routing.module';
import { TourBookingComponent } from './tour-booking.component';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';


@NgModule({
  declarations: [
    TourBookingComponent
  ],
  imports: [
    CommonModule,
    TourBookingRoutingModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class TourBookingModule { }
