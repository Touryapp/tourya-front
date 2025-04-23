import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightBookingConfirmationComponent } from './flight-booking-confirmation.component';

const routes: Routes = [{ path: '', component: FlightBookingConfirmationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightBookingConfirmationRoutingModule { }
