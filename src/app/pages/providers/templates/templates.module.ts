import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TemplatesRoutingModule } from "./templates-routing.module";
import { TemplatesComponent } from "./templates.component";
import { TemplateListComponent } from "./template-list/template-list.component";
import { TemplateFormComponent } from "./template-form/template-form.component";
import { SharedModule } from "../../../shared/shared-module";

@NgModule({
  declarations: [
    TemplatesComponent,
    TemplateListComponent,
    TemplateFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TemplatesRoutingModule
  ],
  exports: [
    TemplateListComponent
  ]
})
export class TemplatesModule { }
