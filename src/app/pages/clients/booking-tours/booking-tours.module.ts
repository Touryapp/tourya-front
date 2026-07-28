import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingToursRoutingModule } from './booking-tours-routing.module';
import { BookingToursComponent } from './booking-tours.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    BookingToursComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    BookingToursRoutingModule
  ]
})
export class BookingToursModule { } 