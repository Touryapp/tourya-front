import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentChatRoutingModule } from './agent-chat-routing.module';
import { AgentChatComponent } from './agent-chat.component';


@NgModule({
  declarations: [
    AgentChatComponent
  ],
  imports: [
    CommonModule,
    AgentChatRoutingModule
  ]
})
export class AgentChatModule { }
