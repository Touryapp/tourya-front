import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentRoutingModule } from './agent-routing.module';
import { AgentComponent } from './agent.component';
import { CapitalizeWordsPipe } from '../../shared/pipe/capitalize-words.pipe';


@NgModule({
  declarations: [
    AgentComponent,
    CapitalizeWordsPipe
  ],
  imports: [
    CommonModule,
    AgentRoutingModule
  ]
})
export class AgentModule { }
