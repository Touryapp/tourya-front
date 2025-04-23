import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlansSettingsComponent } from './plans-settings.component';

const routes: Routes = [{ path: '', component: PlansSettingsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlansSettingsRoutingModule { }
