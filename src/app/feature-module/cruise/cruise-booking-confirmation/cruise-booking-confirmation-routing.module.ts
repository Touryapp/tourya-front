import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CruiseBookingConfirmationComponent } from './cruise-booking-confirmation.component';

const routes: Routes = [{ path: '', component: CruiseBookingConfirmationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CruiseBookingConfirmationRoutingModule { }
