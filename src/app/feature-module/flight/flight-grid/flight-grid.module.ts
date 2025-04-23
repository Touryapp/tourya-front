import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightGridRoutingModule } from './flight-grid-routing.module';
import { FlightGridComponent } from './flight-grid.component';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    FlightGridComponent
  ],
  imports: [
    CommonModule,
    FlightGridRoutingModule,
    MatSliderModule,
    SharedModule
  ]
})
export class FlightGridModule { }
