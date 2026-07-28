import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TourRoutingModule } from "./tour-routing.module";
import { TourComponent } from "./tour.component";
import { SharedModule } from "../../../shared/shared-module";
import { TourListViewComponent } from "./tour-list-view/tour-list-view.component";

@NgModule({
  declarations: [TourComponent, TourListViewComponent],
  imports: [CommonModule, SharedModule, TourRoutingModule],
  exports: [TourListViewComponent],
})
export class TourModule {}
