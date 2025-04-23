import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditCruiseComponent } from './edit-cruise.component';

const routes: Routes = [{ path: '', component: EditCruiseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditCruiseRoutingModule { }
