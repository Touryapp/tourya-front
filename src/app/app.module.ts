import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared-module";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { NgScrollbarModule } from "ngx-scrollbar";
import { ForgotPasswordComponent } from "./auth/forgot-password/forgot-password.component";
import { RegisterComponent } from "./auth/register/register.component";
import { ChangePasswordComponent } from "./auth/change-password/change-password.component";
import { Error404Component } from "./auth/error-404/error-404.component";
import { Error500Component } from "./auth/error-500/error-500.component";
import { ComingSoonComponent } from "./auth/coming-soon/coming-soon.component";
import { UnderMaintenanceComponent } from "./auth/under-maintenance/under-maintenance.component";
import { LoginComponent } from "./auth/login/login.component";
import { RegisterTouristEmailComponent } from "./auth/register-tourist-email/register-tourist-email.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    RegisterTouristEmailComponent,
    ChangePasswordComponent,
    Error404Component,
    Error500Component,
    ComingSoonComponent,
    UnderMaintenanceComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, SharedModule, NgScrollbarModule],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
