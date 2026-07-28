import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingToursComponent } from './booking-tours.component';

const routes: Routes = [
  {
    path: '',
    component: BookingToursComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingToursRoutingModule { } 