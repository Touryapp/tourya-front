import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerFlightBookingComponent } from './customer-flight-booking.component';

const routes: Routes = [{ path: '', component: CustomerFlightBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerFlightBookingRoutingModule { }
