import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from '../../core/guards/admin.guard';
import { BackofficeGuard } from '../../core/guards/backoffice.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // FE-15b: dashboard y tour-admin (aprobar tours + comisión) siguen siendo ADMIN puro.
      {
        path: 'dashboard',
        canActivate: [AdminGuard],
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'tour-admin',
        canActivate: [AdminGuard],
        loadChildren: () => import('./tour-admin/tour-admin.module').then(m => m.TourAdminModule)
      },
      // FE-15b: bookings-management pasa a BackofficeGuard (subset P2 — "ver reservas").
      {
        path: 'bookings-management',
        canActivate: [BackofficeGuard],
        loadChildren: () => import('../providers/provider-tour-management/provider-tour-management.module').then(m => m.ProviderTourManagementModule)
      },
      // FE-15c: reportes DIMAR expuestos al rol BACKOFFICE_OPERATION.
      {
        path: 'maritime-reports',
        canActivate: [BackofficeGuard],
        loadComponent: () => import('../maritime-activity-reports/maritime-activity-reports.component').then(m => m.MaritimeActivityReportsComponent)
      },
      // TC-008 (#195 refinamiento Luis 2026-08-03): ordenes de pago expuestas al
      // rol BACKOFFICE_OPERATION. El componente ya existia dentro del dashboard;
      // ahora es una ruta propia para que BO pueda acceder sin AdminGuard.
      // Se usa loadChildren + un pequeno wrapper routing para mantener el modulo
      // NgModule original (que no tenia RouterModule.forChild propio).
      {
        path: 'provider-payments',
        canActivate: [BackofficeGuard],
        loadChildren: () => import('./provider-payments-wrapper-routing.module').then(m => m.ProviderPaymentsWrapperRoutingModule)
      },
      // FE-15d: CRUD de usuarios BACKOFFICE_OPERATION. Solo ADMIN puede gestionar.
      {
        path: 'backoffice-users',
        canActivate: [AdminGuard],
        loadComponent: () => import('./backoffice-users/backoffice-users.component').then(m => m.BackofficeUsersComponent)
      },
      // TC-022: gestion de creditos y devoluciones. Expuesto a ADMIN + BACKOFFICE_OPERATION.
      {
        path: 'credits',
        canActivate: [BackofficeGuard],
        loadComponent: () => import('./admin-credits/admin-credits.component').then(m => m.AdminCreditsComponent)
      },
      // FE IA-11: dashboard admin de observabilidad de agentes IA (consume
      // GET /admin/agents/* del backend IA-11). Expuesto a ADMIN + BACKOFFICE_OPERATION.
      {
        path: 'agents',
        canActivate: [BackofficeGuard],
        loadComponent: () => import('./agents-observability/agents-observability.component').then(m => m.AgentsObservabilityComponent)
      },
      // FE IA-10: cola de moderacion de resenas (consume /admin/reviews/moderation
      // y /admin/agents/review-moderation/{id}/re-moderate del backend IA-10).
      // Expuesto a ADMIN + BACKOFFICE_OPERATION.
      {
        path: 'reviews/moderation',
        canActivate: [BackofficeGuard],
        loadComponent: () => import('./reviews-moderation/reviews-moderation.component').then(m => m.ReviewsModerationComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
