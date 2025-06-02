import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TourRoutingModule } from "./tour-routing.module";
import { TourComponent } from "./tour.component";
import { SharedModule } from "../../../shared/shared-module";

@NgModule({
  declarations: [TourComponent],
  imports: [CommonModule, SharedModule, TourRoutingModule],
})
export class TourModule {}
