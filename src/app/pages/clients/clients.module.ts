import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ClientsRoutingModule } from "./clients-routing.module";
import { ClientsComponent } from "./clients.component";
import { SharedModule } from "../../shared/shared-module";

@NgModule({
  declarations: [ClientsComponent],
  imports: [CommonModule, SharedModule, ClientsRoutingModule],
})
export class ClientsModule {}
