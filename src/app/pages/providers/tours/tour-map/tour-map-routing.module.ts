import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourMapComponent } from './tour-map.component';

const routes: Routes = [{ path: '', component: TourMapComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourMapRoutingModule { }
