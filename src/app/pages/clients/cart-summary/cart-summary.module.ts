import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartSummaryRoutingModule } from './cart-summary-routing.module';
import { CartSummaryComponent } from './cart-summary.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    CartSummaryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CartSummaryRoutingModule
  ]
})
export class CartSummaryModule { }