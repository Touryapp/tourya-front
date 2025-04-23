import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingConfirmationRoutingModule } from './booking-confirmation-routing.module';
import { BookingConfirmationComponent } from './booking-confirmation.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    BookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    BookingConfirmationRoutingModule,
    SharedModule
  ]
})
export class BookingConfirmationModule { }
