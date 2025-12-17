import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderTourManagementComponent } from './provider-tour-management.component';

const routes: Routes = [
  {
    path: '',
    component: ProviderTourManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderTourManagementRoutingModule { }
