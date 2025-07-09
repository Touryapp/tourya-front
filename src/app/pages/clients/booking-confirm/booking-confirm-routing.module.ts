import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingConfirmComponent } from './booking-confirm.component';

const routes: Routes = [
  {
    path: '',
    component: BookingConfirmComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingConfirmRoutingModule { } 