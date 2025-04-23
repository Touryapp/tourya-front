import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EarningsRoutingModule } from './earnings-routing.module';
import { EarningsComponent } from './earnings.component';
import { EarningsTableComponent } from './earnings-table/earnings-table.component';
import { WithdrawTableComponent } from './withdraw-table/withdraw-table.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSortModule } from '@angular/material/sort';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';


@NgModule({
  declarations: [
    EarningsComponent,
    EarningsTableComponent,
    WithdrawTableComponent
  ],
  imports: [
    CommonModule,
    EarningsRoutingModule,
    MatSortModule,
    SharedModule,
    CustomPaginationModule,
  ]
})
export class EarningsModule { }
