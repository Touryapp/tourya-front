import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientCreditsComponent } from './client-credits.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    ClientCreditsComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ClientCreditsComponent
  ]
})
export class ClientCreditsModule { }
