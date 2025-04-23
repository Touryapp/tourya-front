import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarBookingComponent } from './car-booking.component';

const routes: Routes = [{ path: '', component: CarBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarBookingRoutingModule { }
