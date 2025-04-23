import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentNotificationComponent } from './agent-notification.component';

const routes: Routes = [{ path: '', component: AgentNotificationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentNotificationRoutingModule { }
