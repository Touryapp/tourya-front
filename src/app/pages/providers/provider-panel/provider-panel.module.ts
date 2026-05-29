import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { ProviderPanelRoutingModule } from "./provider-panel-routing.module";
import { ProviderPanelComponent } from "./provider-panel.component";
import { SharedModule } from "../../../shared/shared-module";
import { TourModule } from "../tours/tour.module";
import { TemplatesModule } from "../templates/templates.module";
import { ProviderTourManagementModule } from "../provider-tour-management/provider-tour-management.module";
import { ProviderReviewsComponent } from "../provider-reviews/provider-reviews.component";
import { ProviderPaymentsModule } from "../provider-payments/provider-payments.module";
import { RequestprovidersModule } from "../requestproviders/requestproviders.module";

@NgModule({
  declarations: [
    ProviderPanelComponent,
    ProviderReviewsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ProviderPanelRoutingModule,
    TourModule,
    TemplatesModule,
    ProviderTourManagementModule,
    ProviderPaymentsModule,
    RequestprovidersModule
  ],
  exports: [
    ProviderReviewsComponent
  ]
})
export class ProviderPanelModule {}
