import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourBookingComponent } from './tour-booking.component';

const routes: Routes = [{ path: '', component: TourBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourBookingRoutingModule { }
