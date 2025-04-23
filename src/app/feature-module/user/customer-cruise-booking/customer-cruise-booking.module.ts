import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerCruiseBookingRoutingModule } from './customer-cruise-booking-routing.module';
import { CustomerCruiseBookingComponent } from './customer-cruise-booking.component';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';


@NgModule({
  declarations: [
    CustomerCruiseBookingComponent
  ],
  imports: [
    CommonModule,
    CustomerCruiseBookingRoutingModule,
    MatSortModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class CustomerCruiseBookingModule { }
