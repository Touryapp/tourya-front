import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TourScheduleTestRoutingModule } from "./tour-schedule-test-routing.module";
import { TourScheduleTestComponent } from "./tour-schedule-test.component";
import { SharedModule } from "../../../../shared/shared-module";

@NgModule({
  declarations: [TourScheduleTestComponent],
  imports: [CommonModule, TourScheduleTestRoutingModule, SharedModule],
})
export class TourScheduleTestModule {}
