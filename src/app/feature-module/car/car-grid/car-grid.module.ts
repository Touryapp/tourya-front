import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarGridRoutingModule } from './car-grid-routing.module';
import { CarGridComponent } from './car-grid.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    CarGridComponent
  ],
  imports: [
    CommonModule,
    CarGridRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class CarGridModule { }
