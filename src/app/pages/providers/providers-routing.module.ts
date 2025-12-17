import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ProvidersComponent } from "./providers.component";
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
      },
      {
        path: "requestproviders",
        loadChildren: () =>
          import("./requestproviders/requestproviders.module").then((m) => m.RequestprovidersModule),
      },
      {
        path: "provider-panel",
        loadChildren: () =>
          import("./provider-panel/provider-panel.module").then((m) => m.ProviderPanelModule),
      },
      {
        path: "templates",
        loadChildren: () =>
          import("./templates/templates.module").then((m) => m.TemplatesModule),
      },
      {
        path: "scan-qr/:bookingId",
        component: QrScannerComponent,
      },
      {
        path: "scan-qr",
        component: QrScannerComponent,
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
