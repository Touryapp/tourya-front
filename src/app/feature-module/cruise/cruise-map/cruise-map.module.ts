import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseMapRoutingModule } from './cruise-map-routing.module';
import { CruiseMapComponent } from './cruise-map.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    CruiseMapComponent
  ],
  imports: [
    CommonModule,
    CruiseMapRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class CruiseMapModule { }
