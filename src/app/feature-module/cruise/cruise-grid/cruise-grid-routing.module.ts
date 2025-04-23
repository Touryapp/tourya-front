import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CruiseGridComponent } from './cruise-grid.component';

const routes: Routes = [{ path: '', component: CruiseGridComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CruiseGridRoutingModule { }
