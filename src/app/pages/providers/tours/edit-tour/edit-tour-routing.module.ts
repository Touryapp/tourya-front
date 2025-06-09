import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditTourComponent } from './edit-tour.component';

const routes: Routes = [{ path: '', component: EditTourComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditTourRoutingModule { }
