import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TourGridRoutingModule } from "./tour-grid-routing.module";
import { TourGridComponent } from "./tour-grid.component";
import { MatSliderModule } from "@angular/material/slider";
import { SharedModule } from "../../../../shared/shared-module";

@NgModule({
  declarations: [TourGridComponent],
  imports: [CommonModule, TourGridRoutingModule, SharedModule, MatSliderModule],
})
export class TourGridModule {}
