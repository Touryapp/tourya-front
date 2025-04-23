import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotelBookingsRoutingModule } from './hotel-bookings-routing.module';
import { HotelBookingsComponent } from './hotel-bookings.component';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';


@NgModule({
  declarations: [
    HotelBookingsComponent
  ],
  imports: [
    CommonModule,
    HotelBookingsRoutingModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class HotelBookingsModule { }
