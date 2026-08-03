import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PagesModuleComponent } from "./pages-module.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { AdminGuard } from "../core/guards/admin.guard";
import { BackofficeGuard } from "../core/guards/backoffice.guard";
import { ContactanosComponent } from "./contactanos/contactanos.component";
import { ConocenosComponent } from "./conocenos/conocenos.component";
import { LegalSiteComponent } from "./legal-site/legal-site.component";
import { BlogsiteComponent } from "./blogsite/blogsite.component";

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
      },
      {
        // TC-008 (#195 5ta iter): el padre acepta ADMIN o BACKOFFICE_OPERATION.
        // Los hijos internos siguen protegidos individualmente (AdminGuard para
        // dashboard/tour-admin/backoffice-users, BackofficeGuard para bookings-management/
        // maritime-reports). Antes AdminGuard aca rechazaba a BO antes de que
        // BackofficeGuard del hijo pudiera evaluar — quedaba clavado en /login.
        path: "admin",
        loadChildren: () =>
          import("./admin/admin.module").then((m) => m.AdminModule),
        canActivate: [BackofficeGuard],
      },
      { path: "contactanos", loadComponent: () => import('./contactanos/contactanos.component').then(m => m.ContactanosComponent) },
      { path: "conocenos", loadComponent: () => import('./conocenos/conocenos.component').then(m => m.ConocenosComponent) },
      { path: "blogsite", loadComponent: () => import('./blogsite/blogsite.component').then(m => m.BlogsiteComponent) },
      { path: "legal-site-politics", loadComponent: () => import('./legalsite-politics/legalsite-politics.component').then(m => m.LegalsitePoliticsComponent) },
      { path: "legal-site", loadComponent: () => import('./legal-site/legal-site.component').then(m => m.LegalSiteComponent) },
      { path: "operator-policies", loadComponent: () => import('./operator-policies/operator-policies.component').then(m => m.OperatorPoliciesComponent) }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesModuleRoutingModule {}
