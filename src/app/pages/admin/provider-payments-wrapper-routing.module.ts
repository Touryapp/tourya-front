import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderPaymentsComponent } from '../providers/provider-payments/provider-payments.component';
import { ProviderPaymentsModule } from '../providers/provider-payments/provider-payments.module';

/**
 * TC-008 (#195 refinamiento Luis 2026-08-03): monta ProviderPaymentsComponent
 * bajo /admin/provider-payments. El modulo original ProviderPaymentsModule no
 * tenia routing propio (se usaba embebido en dashboard); este wrapper le agrega
 * la ruta sin modificar el modulo original.
 */
const routes: Routes = [
  { path: '', component: ProviderPaymentsComponent }
];

@NgModule({
  imports: [
    ProviderPaymentsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProviderPaymentsWrapperRoutingModule {}
