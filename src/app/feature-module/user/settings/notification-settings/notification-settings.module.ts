import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationSettingsRoutingModule } from './notification-settings-routing.module';
import { NotificationSettingsComponent } from './notification-settings.component';
import { SharedModule } from '../../../../shared/shared-module';


@NgModule({
  declarations: [
    NotificationSettingsComponent
  ],
  imports: [
    CommonModule,
    NotificationSettingsRoutingModule,
    SharedModule
  ]
})
export class NotificationSettingsModule { }
