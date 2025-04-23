import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlansBillingsRoutingModule } from './plans-billings-routing.module';
import { PlansBillingsComponent } from './plans-billings.component';
import { SharedModule } from '../../../../shared/shared-module';


@NgModule({
  declarations: [
    PlansBillingsComponent
  ],
  imports: [
    CommonModule,
    PlansBillingsRoutingModule,
    SharedModule
  ]
})
export class PlansBillingsModule { }
