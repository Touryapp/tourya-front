import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourBookingConfirmationComponent } from './tour-booking-confirmation.component';

const routes: Routes = [{ path: '', component: TourBookingConfirmationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourBookingConfirmationRoutingModule { }
