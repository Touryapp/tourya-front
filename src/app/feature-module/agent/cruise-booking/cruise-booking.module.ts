import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseBookingRoutingModule } from './cruise-booking-routing.module';
import { CruiseBookingComponent } from './cruise-booking.component';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    CruiseBookingComponent
  ],
  imports: [
    CommonModule,
    CruiseBookingRoutingModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class CruiseBookingModule { }
