import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PagesModuleComponent } from "./pages-module.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { AdminGuard } from "../core/guards/admin.guard";
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
        path: "admin",
        loadChildren: () =>
          import("./admin/admin.module").then((m) => m.AdminModule),
        canActivate: [AdminGuard],
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
