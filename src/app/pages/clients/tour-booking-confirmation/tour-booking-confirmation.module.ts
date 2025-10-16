import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourBookingConfirmationRoutingModule } from './tour-booking-confirmation-routing.module';
import { TourBookingConfirmationComponent } from './tour-booking-confirmation.component';

@NgModule({
  declarations: [
    TourBookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TourBookingConfirmationRoutingModule
  ]
})
export class TourBookingConfirmationModule { }