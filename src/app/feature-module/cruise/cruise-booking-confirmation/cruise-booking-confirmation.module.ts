import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseBookingConfirmationRoutingModule } from './cruise-booking-confirmation-routing.module';
import { CruiseBookingConfirmationComponent } from './cruise-booking-confirmation.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    CruiseBookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    CruiseBookingConfirmationRoutingModule,
    SharedModule
  ]
})
export class CruiseBookingConfirmationModule { }
