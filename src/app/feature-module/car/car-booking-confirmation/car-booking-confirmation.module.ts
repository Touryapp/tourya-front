import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarBookingConfirmationRoutingModule } from './car-booking-confirmation-routing.module';
import { CarBookingConfirmationComponent } from './car-booking-confirmation.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    CarBookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    CarBookingConfirmationRoutingModule,
    SharedModule
  ]
})
export class CarBookingConfirmationModule { }
