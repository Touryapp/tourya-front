import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlansSettingsRoutingModule } from './plans-settings-routing.module';
import { PlansSettingsComponent } from './plans-settings.component';


@NgModule({
  declarations: [
    PlansSettingsComponent
  ],
  imports: [
    CommonModule,
    PlansSettingsRoutingModule
  ]
})
export class PlansSettingsModule { }
