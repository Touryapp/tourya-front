import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerHotelBookingRoutingModule } from './customer-hotel-booking-routing.module';
import { CustomerHotelBookingComponent } from './customer-hotel-booking.component';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { MatSortModule } from '@angular/material/sort';


@NgModule({
  declarations: [
    CustomerHotelBookingComponent
  ],
  imports: [
    CommonModule,
    CustomerHotelBookingRoutingModule,
    SharedModule,
    CustomPaginationModule,
    MatSortModule
  ]
})
export class CustomerHotelBookingModule { }
