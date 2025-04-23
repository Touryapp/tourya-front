import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightBookingConfirmationRoutingModule } from './flight-booking-confirmation-routing.module';
import { FlightBookingConfirmationComponent } from './flight-booking-confirmation.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    FlightBookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    FlightBookingConfirmationRoutingModule,
    SharedModule
  ]
})
export class FlightBookingConfirmationModule { }
