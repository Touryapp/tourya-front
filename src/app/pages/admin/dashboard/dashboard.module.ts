import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../../shared/shared-module';
import { TourAdminModule } from '../tour-admin/tour-admin.module';
import { MaritimeActivityReportsComponent } from '../../maritime-activity-reports/maritime-activity-reports.component';
import { ProviderPaymentsModule } from '../../providers/provider-payments/provider-payments.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    TourAdminModule,
    MaritimeActivityReportsComponent,
    ProviderPaymentsModule
  ]
})
export class DashboardModule { } 