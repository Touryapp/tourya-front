import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourGridComponent } from './tour-grid.component';

const routes: Routes = [{ path: '', component: TourGridComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourGridRoutingModule { }
