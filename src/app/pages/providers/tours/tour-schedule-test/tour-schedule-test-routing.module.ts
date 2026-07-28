import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TourScheduleTestComponent } from "./tour-schedule-test.component";

const routes: Routes = [{ path: "", component: TourScheduleTestComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TourScheduleTestRoutingModule {}
