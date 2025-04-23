import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HotelMapComponent } from './hotel-map.component';

const routes: Routes = [{ path: '', component: HotelMapComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelMapRoutingModule { }
