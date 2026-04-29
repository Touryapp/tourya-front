import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../shared/shared-module";
import { TourListViewComponent } from "./tour-list-view/tour-list-view.component";
import { TourGridViewComponent } from "./tour-grid-view/tour-grid-view.component";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [
    TourListViewComponent,
    TourGridViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  exports: [
    TourListViewComponent,
    TourGridViewComponent,
  ],
})
export class ListToursSharedModule {}
