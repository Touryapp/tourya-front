import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TourMapRoutingModule } from "./tour-map-routing.module";
import { TourMapComponent } from "./tour-map.component";
import { MatSliderModule } from "@angular/material/slider";
import { SharedModule } from "../../../../shared/shared-module";

@NgModule({
  declarations: [TourMapComponent],
  imports: [CommonModule, TourMapRoutingModule, SharedModule, MatSliderModule],
})
export class TourMapModule {}
