import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared-module";
import { ProviderTourManagementComponent } from "./provider-tour-management.component";
import { ProviderTourManagementRoutingModule } from "./provider-tour-management-routing.module";

@NgModule({
  declarations: [ProviderTourManagementComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ProviderTourManagementRoutingModule
  ],
  exports: [ProviderTourManagementComponent]
})
export class ProviderTourManagementModule {}
