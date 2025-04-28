import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginTouristComponent } from "./auth/login-tourist/login-tourist.component";
import { Error404Component } from "./auth/error-404/error-404.component";
import { ChangePasswordComponent } from "./auth/change-password/change-password.component";
import { ComingSoonComponent } from "./auth/coming-soon/coming-soon.component";
import { Error500Component } from "./auth/error-500/error-500.component";
import { ForgotPasswordComponent } from "./auth/forgot-password/forgot-password.component";
import { RegisterTouristComponent } from "./auth/register-tourist/register-tourist.component";
import { UnderMaintenanceComponent } from "./auth/under-maintenance/under-maintenance.component";
import { RegisterTouristEmailComponent } from "./auth/register-tourist-email/register-tourist-email.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },

  {
    path: "login-tourist",
    component: LoginTouristComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "register-tourist",
    component: RegisterTouristComponent,
  },
  {
    path: "register-tourist-email",
    component: RegisterTouristEmailComponent,
  },
  {
    path: "change-password",
    component: ChangePasswordComponent,
  },
  {
    path: "coming-soon",
    component: ComingSoonComponent,
  },
  {
    path: "under-maintenance",
    component: UnderMaintenanceComponent,
  },

  {
    path: "error-500",
    component: Error500Component,
  },
  {
    path: "error-404",
    component: Error404Component,
  },
  {
    path: "feature-module",
    loadChildren: () =>
      import("./feature-module/feature-module.module").then(
        (m) => m.FeatureModuleModule
      ),
  },
  {
    path: "",
    loadChildren: () =>
      import("./pages/pages-module.module").then((m) => m.PagesModuleModule),
  },
  {
    path: "**",
    redirectTo: "/error-404",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
