import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerCarBookingRoutingModule } from './customer-car-booking-routing.module';
import { CustomerCarBookingComponent } from './customer-car-booking.component';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';


@NgModule({
  declarations: [
    CustomerCarBookingComponent
  ],
  imports: [
    CommonModule,
    CustomerCarBookingRoutingModule,
    MatSortModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class CustomerCarBookingModule { }
