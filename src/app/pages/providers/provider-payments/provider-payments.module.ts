import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProviderPaymentsComponent } from './provider-payments.component';
import { SharedModule } from '../../../shared/shared-module';
import { ProviderPaymentDetailsModalComponent } from './provider-payment-details-modal/provider-payment-details-modal.component';

@NgModule({
  declarations: [
    ProviderPaymentsComponent,
    ProviderPaymentDetailsModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    ProviderPaymentsComponent
  ]
})
export class ProviderPaymentsModule { }
