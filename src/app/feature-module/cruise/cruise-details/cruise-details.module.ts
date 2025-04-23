import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseDetailsRoutingModule } from './cruise-details-routing.module';
import { CruiseDetailsComponent } from './cruise-details.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    CruiseDetailsComponent
  ],
  imports: [
    CommonModule,
    CruiseDetailsRoutingModule,
    SharedModule
  ]
})
export class CruiseDetailsModule { }
