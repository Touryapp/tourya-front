import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TourGalleryComponent } from "./tour-gallery.component";

const routes: Routes = [{ path: ":id", component: TourGalleryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TourGalleryRoutingModule {}
