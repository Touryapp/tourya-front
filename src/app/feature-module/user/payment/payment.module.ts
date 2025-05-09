import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';
import { SharedModule } from '../../../shared/shared-module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';


@NgModule({
  declarations: [
    PaymentComponent
  ],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    SharedModule,
    CustomPaginationModule
  ]
})
export class PaymentModule { }
