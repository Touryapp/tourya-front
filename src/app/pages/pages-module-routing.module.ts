import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PagesModuleComponent } from "./pages-module.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { AdminGuard } from "../core/guards/admin.guard";

const routes: Routes = [
  {
    path: "",
    component: PagesModuleComponent,
    canActivate: [],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./clients/clients.module").then((m) => m.ClientsModule),
      },
      {
        path: "providers",
        loadChildren: () =>
          import("./providers/providers.module").then((m) => m.ProvidersModule),
        canActivate: [AuthGuard],
      },
      {
        path: "admin",
        loadChildren: () =>
          import("./admin/admin.module").then((m) => m.AdminModule),
        canActivate: [AdminGuard],
      },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesModuleRoutingModule {}
