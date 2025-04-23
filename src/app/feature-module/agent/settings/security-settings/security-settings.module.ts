import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecuritySettingsRoutingModule } from './security-settings-routing.module';
import { SecuritySettingsComponent } from './security-settings.component';


@NgModule({
  declarations: [
    SecuritySettingsComponent
  ],
  imports: [
    CommonModule,
    SecuritySettingsRoutingModule
  ]
})
export class SecuritySettingsModule { }
