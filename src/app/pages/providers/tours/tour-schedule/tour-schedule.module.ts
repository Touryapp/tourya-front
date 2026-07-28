import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TourScheduleRoutingModule } from "./tour-schedule-routing.module";
import { TourScheduleComponent } from "./tour-schedule.component";
import { SharedModule } from "../../../../shared/shared-module";

@NgModule({
  declarations: [TourScheduleComponent],
  imports: [CommonModule, TourScheduleRoutingModule, SharedModule],
})
export class TourScheduleModule {}
