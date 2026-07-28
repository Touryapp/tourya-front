import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TourDetailsProviderComponent } from "./tour-details.component";

const routes: Routes = [{ path: ":id", component: TourDetailsProviderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TourDetailsProviderRoutingModule {}
