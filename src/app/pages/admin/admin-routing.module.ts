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
      // FE-15d: CRUD de usuarios BACKOFFICE_OPERATION. Solo ADMIN puede gestionar.
      {
        path: 'backoffice-users',
        canActivate: [AdminGuard],
        loadComponent: () => import('./backoffice-users/backoffice-users.component').then(m => m.BackofficeUsersComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 