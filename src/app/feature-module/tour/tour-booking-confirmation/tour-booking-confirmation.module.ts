import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourBookingConfirmationRoutingModule } from './tour-booking-confirmation-routing.module';
import { TourBookingConfirmationComponent } from './tour-booking-confirmation.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    TourBookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    TourBookingConfirmationRoutingModule,
    SharedModule
  ]
})
export class TourBookingConfirmationModule { }
