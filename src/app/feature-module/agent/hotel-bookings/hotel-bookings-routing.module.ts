import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HotelBookingsComponent } from './hotel-bookings.component';

const routes: Routes = [{ path: '', component: HotelBookingsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelBookingsRoutingModule { }
