import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarGridComponent } from './car-grid.component';

const routes: Routes = [{ path: '', component: CarGridComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarGridRoutingModule { }
