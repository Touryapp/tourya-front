import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TourDetailsProviderComponent } from "./tour-details.component";
import { SharedModule } from "../../../../shared/shared-module";
import { TourDetailsProviderRoutingModule } from "./tour-details-routing.module";
import { GoogleMapsModule } from "@angular/google-maps";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [TourDetailsProviderComponent],
  imports: [CommonModule,
    ReactiveFormsModule,
    SharedModule,
    GoogleMapsModule,
    TourDetailsProviderRoutingModule],
})
export class TourDetailsProviderModule {}
