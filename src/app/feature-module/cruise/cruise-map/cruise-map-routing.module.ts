import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CruiseMapComponent } from './cruise-map.component';

const routes: Routes = [{ path: '', component: CruiseMapComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CruiseMapRoutingModule { }
