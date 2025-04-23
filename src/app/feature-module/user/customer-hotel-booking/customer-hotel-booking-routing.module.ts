import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerHotelBookingComponent } from './customer-hotel-booking.component';

const routes: Routes = [{ path: '', component: CustomerHotelBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerHotelBookingRoutingModule { }
