import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseGridRoutingModule } from './cruise-grid-routing.module';
import { CruiseGridComponent } from './cruise-grid.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    CruiseGridComponent
  ],
  imports: [
    CommonModule,
    CruiseGridRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class CruiseGridModule { }
