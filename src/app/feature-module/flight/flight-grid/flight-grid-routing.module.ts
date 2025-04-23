import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightGridComponent } from './flight-grid.component';

const routes: Routes = [{ path: '', component: FlightGridComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightGridRoutingModule { }
