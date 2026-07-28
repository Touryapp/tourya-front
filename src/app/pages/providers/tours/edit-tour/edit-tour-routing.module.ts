import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddTourComponent } from "../add-tour/add-tour.component";

const routes: Routes = [{ path: ":id", component: AddTourComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditTourRoutingModule {}
