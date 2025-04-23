import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntegrationSettingsComponent } from './integration-settings.component';

const routes: Routes = [{ path: '', component: IntegrationSettingsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntegrationSettingsRoutingModule { }
