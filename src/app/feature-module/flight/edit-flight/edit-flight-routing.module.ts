import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditFlightComponent } from './edit-flight.component';

const routes: Routes = [{ path: '', component: EditFlightComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditFlightRoutingModule { }
