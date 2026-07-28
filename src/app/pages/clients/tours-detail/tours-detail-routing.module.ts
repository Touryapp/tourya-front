import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToursDetailComponent } from './tours-detail.component';

const routes: Routes = [
  {
    path: ':id',
    component: ToursDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToursDetailRoutingModule { } 