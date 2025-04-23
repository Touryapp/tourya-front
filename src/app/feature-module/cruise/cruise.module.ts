import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseRoutingModule } from './cruise-routing.module';
import { CruiseComponent } from './cruise.component';
import { SharedModule } from '../../shared/shared-module';


@NgModule({
  declarations: [
    CruiseComponent
  ],
  imports: [
    CommonModule,
    CruiseRoutingModule,
    SharedModule
  ]
})
export class CruiseModule { }
