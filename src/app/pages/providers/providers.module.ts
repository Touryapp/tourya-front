import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProvidersRoutingModule } from "./providers-routing.module";
import { ProvidersComponent } from "./providers.component";
import { HomeComponent } from "./home/home.component";
import { SharedModule } from "../../shared/shared-module";
import { CountUpModule } from "ngx-countup";

@NgModule({
  declarations: [ProvidersComponent, HomeComponent],
  imports: [CommonModule, SharedModule, ProvidersRoutingModule, CountUpModule],
})
export class ProvidersModule {}
