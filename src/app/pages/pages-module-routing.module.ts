import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PagesModuleComponent } from "./pages-module.component";
import { AuthGuard } from "../core/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: PagesModuleComponent,
    canActivate: [],
    children: [
      {
        path: "home-clients",
        loadChildren: () =>
          import("../feature-module/home/home.module").then(
            (m) => m.HomeModule
          ),
      },
      {
        path: "home",
        loadChildren: () =>
          import("./clients/home-clients/home-clients.module").then(
            (m) => m.HomeClientsModule
          ),
      },
      {
        path: "clients/list-tours",
        loadChildren: () =>
          import("./clients/list-tours/list-tours.module").then(
            (m) => m.ListToursModule
          ),
      },
      {
        path: "clients/tours-detail",
        loadChildren: () =>
          import("./clients/tours-detail/tours-detail.module").then(
            (m) => m.ToursDetailModule
          ),
      },
      {
        path: "clients/booking-tours",
        loadChildren: () =>
          import("./clients/booking-tours/booking-tours.module").then(
            (m) => m.BookingToursModule
          ),
      },
      {
        path: "clients/booking-confirm",
        loadChildren: () =>
          import("./clients/booking-confirm/booking-confirm.module").then(
            (m) => m.BookingConfirmModule
          ),
      },
      {
        path: "providers",
        loadChildren: () =>
          import("./providers/providers.module").then((m) => m.ProvidersModule),
      },
      {
        path: "admin",
        loadChildren: () =>
          import("./admin/admin.module").then((m) => m.AdminModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesModuleRoutingModule {}
