import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarBookingConfirmationComponent } from './car-booking-confirmation.component';

const routes: Routes = [{ path: '', component: CarBookingConfirmationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarBookingConfirmationRoutingModule { }
