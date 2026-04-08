import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ProvidersComponent } from "./providers.component";
import { AuthGuard } from "../../core/guards/auth.guard";
import { QrScannerComponent } from "./qr-scanner/qr-scanner.component";

const routes: Routes = [
  {
    path: "",
    component: ProvidersComponent,
    children: [
      {
        path: "home",
        component: HomeComponent,
      },
      {
        path: "tours",
        loadChildren: () =>
          import("./tours/tour.module").then((m) => m.TourModule),
        canActivate: [AuthGuard],
      },
      {
        path: "requestproviders",
        loadChildren: () =>
          import("./requestproviders/requestproviders.module").then((m) => m.RequestprovidersModule),
        canActivate: [AuthGuard],
      },
      {
        path: "provider-panel",
        loadChildren: () =>
          import("./provider-panel/provider-panel.module").then((m) => m.ProviderPanelModule),
        canActivate: [AuthGuard],
      },
      {
        path: "templates",
        loadChildren: () =>
          import("./templates/templates.module").then((m) => m.TemplatesModule),
        canActivate: [AuthGuard],
      },
      {
        path: "scan-qr/:bookingId",
        component: QrScannerComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "scan-qr",
        component: QrScannerComponent,
        canActivate: [AuthGuard],
      },
      { path: "", redirectTo: "provider-panel", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProvidersRoutingModule {}
