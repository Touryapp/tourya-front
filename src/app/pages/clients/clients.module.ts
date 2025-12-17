import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ClientsRoutingModule } from "./clients-routing.module";
import { ClientsComponent } from "./clients.component";
import { SharedModule } from "../../shared/shared-module";
import { ClientDashboardComponent } from "./client-dashboard/client-dashboard.component";

@NgModule({
  declarations: [ClientsComponent, ClientDashboardComponent],
  imports: [CommonModule, SharedModule, ClientsRoutingModule],
  exports: [ClientDashboardComponent]
})
export class ClientsModule {}
