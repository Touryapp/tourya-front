import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HotelGridComponent } from './hotel-grid.component';

const routes: Routes = [{ path: '', component: HotelGridComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelGridRoutingModule { }
