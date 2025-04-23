import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerFlightBookingRoutingModule } from './customer-flight-booking-routing.module';
import { CustomerFlightBookingComponent } from './customer-flight-booking.component';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';



@NgModule({
  declarations: [
    CustomerFlightBookingComponent,
    
  ],
  imports: [
    CommonModule,
    CustomerFlightBookingRoutingModule,
    MatSortModule,
    SharedModule,
    CustomPaginationModule,
  ]
})
export class CustomerFlightBookingModule { }
