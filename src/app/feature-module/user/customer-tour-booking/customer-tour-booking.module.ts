import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerTourBookingRoutingModule } from './customer-tour-booking-routing.module';
import { CustomerTourBookingComponent } from './customer-tour-booking.component';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { MatSortModule } from '@angular/material/sort';


@NgModule({
  declarations: [
    CustomerTourBookingComponent
  ],
  imports: [
    CommonModule,
    CustomerTourBookingRoutingModule,
    SharedModule,
    CustomPaginationModule,
    MatSortModule
  ]
})
export class CustomerTourBookingModule { }
