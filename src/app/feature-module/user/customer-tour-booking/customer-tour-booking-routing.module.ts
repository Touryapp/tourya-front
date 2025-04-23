import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerTourBookingComponent } from './customer-tour-booking.component';

const routes: Routes = [{ path: '', component: CustomerTourBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerTourBookingRoutingModule { }
