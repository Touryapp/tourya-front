import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProviderPanelRoutingModule } from './provider-panel-routing.module';
import { ProviderPanelComponent } from './provider-panel.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    ProviderPanelComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ProviderPanelRoutingModule
  ]
})
export class ProviderPanelModule { } 