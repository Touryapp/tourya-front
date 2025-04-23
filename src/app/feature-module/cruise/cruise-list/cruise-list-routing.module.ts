import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CruiseListComponent } from './cruise-list.component';

const routes: Routes = [{ path: '', component: CruiseListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CruiseListRoutingModule { }
