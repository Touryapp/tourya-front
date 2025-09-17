import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TemplatesComponent } from "./templates.component";
import { TemplateListComponent } from "./template-list/template-list.component";
import { TemplateFormComponent } from "./template-form/template-form.component";

const routes: Routes = [
  {
    path: "",
    component: TemplatesComponent,
    children: [
      {
        path: "",
        component: TemplateListComponent
      },
      {
        path: "create",
        component: TemplateFormComponent
      },
      {
        path: "edit/:id",
        component: TemplateFormComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule { }
