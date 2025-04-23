import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarMapRoutingModule } from './car-map-routing.module';
import { CarMapComponent } from './car-map.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    CarMapComponent
  ],
  imports: [
    CommonModule,
    CarMapRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class CarMapModule { }
