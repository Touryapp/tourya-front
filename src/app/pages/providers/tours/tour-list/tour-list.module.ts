import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TourListRoutingModule } from "./tour-list-routing.module";
import { TourListComponent } from "./tour-list.component";
import { TourPrincipalOperatorModalComponent } from "./tour-principal-operator-modal/tour-principal-operator-modal.component";
import { MatSliderModule } from "@angular/material/slider";
import { SharedModule } from "../../../../shared/shared-module";

@NgModule({
  declarations: [TourListComponent, TourPrincipalOperatorModalComponent],
  imports: [CommonModule, TourListRoutingModule, SharedModule, MatSliderModule],
})
export class TourListModule {}
