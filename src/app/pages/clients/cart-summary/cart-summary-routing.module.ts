import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartSummaryComponent } from './cart-summary.component';

const routes: Routes = [
  {
    path: '',
    component: CartSummaryComponent,
    data: { title: 'Resumen del Carrito' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartSummaryRoutingModule { }