import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component'; 

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
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'tour-admin',
        loadChildren: () => import('./tour-admin/tour-admin.module').then(m => m.TourAdminModule)
      },
      {
        path: 'bookings-management',
        loadChildren: () => import('../providers/provider-tour-management/provider-tour-management.module').then(m => m.ProviderTourManagementModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 