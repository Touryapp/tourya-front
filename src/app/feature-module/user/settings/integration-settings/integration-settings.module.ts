import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntegrationSettingsRoutingModule } from './integration-settings-routing.module';
import { IntegrationSettingsComponent } from './integration-settings.component';
import { SharedModule } from '../../../../shared/shared-module';


@NgModule({
  declarations: [
    IntegrationSettingsComponent
  ],
  imports: [
    CommonModule,
    IntegrationSettingsRoutingModule,
    SharedModule
  ]
})
export class IntegrationSettingsModule { }
