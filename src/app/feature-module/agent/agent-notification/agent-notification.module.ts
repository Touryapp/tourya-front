import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentNotificationRoutingModule } from './agent-notification-routing.module';
import { AgentNotificationComponent } from './agent-notification.component';


@NgModule({
  declarations: [
    AgentNotificationComponent
  ],
  imports: [
    CommonModule,
    AgentNotificationRoutingModule
  ]
})
export class AgentNotificationModule { }
