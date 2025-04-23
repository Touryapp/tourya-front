import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerCruiseBookingComponent } from './customer-cruise-booking.component';

const routes: Routes = [{ path: '', component: CustomerCruiseBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerCruiseBookingRoutingModule { }
