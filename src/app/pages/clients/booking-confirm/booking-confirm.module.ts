import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingConfirmRoutingModule } from './booking-confirm-routing.module';
import { BookingConfirmComponent } from './booking-confirm.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    BookingConfirmComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BookingConfirmRoutingModule
  ]
})
export class BookingConfirmModule { } 