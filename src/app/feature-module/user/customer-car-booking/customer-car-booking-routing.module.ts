import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerCarBookingComponent } from './customer-car-booking.component';

const routes: Routes = [{ path: '', component: CustomerCarBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerCarBookingRoutingModule { }
