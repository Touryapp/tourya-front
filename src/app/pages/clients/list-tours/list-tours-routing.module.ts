import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListToursComponent } from './list-tours.component';

const routes: Routes = [
  {
    path: '',
    component: ListToursComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListToursRoutingModule { } 