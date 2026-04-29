import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { ListToursRoutingModule } from "./list-tours-routing.module";
import { ListToursComponent } from "./list-tours.component";
import { SharedModule } from "../../../shared/shared-module";
import { TourListViewComponent } from "./tour-list-view/tour-list-view.component";
import { TourGridViewComponent } from "./tour-grid-view/tour-grid-view.component";
import { ListToursSharedModule } from "./list-tours-shared.module";

@NgModule({
  declarations: [
    ListToursComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    SharedModule,
    ListToursRoutingModule,
    ListToursSharedModule,
  ],
  exports: [ListToursSharedModule],
})
export class ListToursModule {}
