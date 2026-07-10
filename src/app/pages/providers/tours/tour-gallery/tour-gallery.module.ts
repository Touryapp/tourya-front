import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

import { TourGalleryRoutingModule } from "./tour-gallery-routing.module";
import { SharedModule } from "../../../../shared/shared-module";
import { TourGalleryComponent } from "./tour-gallery.component";

@NgModule({
  declarations: [TourGalleryComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TourGalleryRoutingModule,
    SharedModule,
  ],
})
export class TourGalleryModule {}
