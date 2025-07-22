import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClientsComponent } from "./clients.component";
import { AdminGuard } from "../../core/guards/admin.guard";
import { HomeRedirectGuard } from "../../core/guards/home-redirect.guard";

const routes: Routes = [
  {
    path: "",
    component: ClientsComponent,
    children: [
      {
        path: "home",
        loadChildren: () =>
          import("./home-clients/home-clients.module").then(
            (m) => m.HomeClientsModule
          ),
        canActivate: [HomeRedirectGuard],
      },
      {
        path: "clients/list-tours",
        loadChildren: () =>
          import("./list-tours/list-tours.module").then(
            (m) => m.ListToursModule
          ),
      },
      {
        path: "clients/tours-detail",
        loadChildren: () =>
          import("./tours-detail/tours-detail.module").then(
            (m) => m.ToursDetailModule
          ),
      },
      {
        path: "clients/booking-tours",
        loadChildren: () =>
          import("./booking-tours/booking-tours.module").then(
            (m) => m.BookingToursModule
          ),
      },
      {
        path: "clients/booking-confirm",
        loadChildren: () =>
          import("./booking-confirm/booking-confirm.module").then(
            (m) => m.BookingConfirmModule
          ),
      },
      { path: "", redirectTo: "home", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientsRoutingModule {}
