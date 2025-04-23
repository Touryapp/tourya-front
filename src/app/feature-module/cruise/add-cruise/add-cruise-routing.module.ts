import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddCruiseComponent } from './add-cruise.component';

const routes: Routes = [{ path: '', component: AddCruiseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddCruiseRoutingModule { }
