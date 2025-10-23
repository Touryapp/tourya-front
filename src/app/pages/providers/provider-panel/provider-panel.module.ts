import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { ProviderPanelRoutingModule } from "./provider-panel-routing.module";
import { ProviderPanelComponent } from "./provider-panel.component";
import { SharedModule } from "../../../shared/shared-module";
import { TourModule } from "../tours/tour.module";
import { TemplatesModule } from "../templates/templates.module";
import { ProviderTourManagementComponent } from "../provider-tour-management/provider-tour-management.component";
import { ProviderReviewsComponent } from "../provider-reviews/provider-reviews.component";

@NgModule({
  declarations: [
    ProviderPanelComponent,
    ProviderTourManagementComponent,
    ProviderReviewsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ProviderPanelRoutingModule,
    TourModule,
    TemplatesModule
  ],
})
export class ProviderPanelModule {}
