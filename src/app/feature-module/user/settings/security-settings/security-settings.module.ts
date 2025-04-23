import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecuritySettingsRoutingModule } from './security-settings-routing.module';
import { SecuritySettingsComponent } from './security-settings.component';
import { SharedModule } from '../../../../shared/shared-module';


@NgModule({
  declarations: [
    SecuritySettingsComponent
  ],
  imports: [
    CommonModule,
    SecuritySettingsRoutingModule,
    SharedModule
  ]
})
export class SecuritySettingsModule { }
