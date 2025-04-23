import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseBookingRoutingModule } from './cruise-booking-routing.module';
import { CruiseBookingComponent } from './cruise-booking.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    CruiseBookingComponent
  ],
  imports: [
    CommonModule,
    CruiseBookingRoutingModule,
    SharedModule
  ]
})
export class CruiseBookingModule { }
