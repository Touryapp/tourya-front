import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarMapComponent } from './car-map.component';

const routes: Routes = [{ path: '', component: CarMapComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarMapRoutingModule { }
