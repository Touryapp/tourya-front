import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CruiseBookingComponent } from './cruise-booking.component';

const routes: Routes = [{ path: '', component: CruiseBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CruiseBookingRoutingModule { }
