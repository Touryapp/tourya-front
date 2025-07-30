import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TourScheduleComponent } from "./tour-schedule.component";

const routes: Routes = [{ path: "", component: TourScheduleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TourScheduleRoutingModule {}
