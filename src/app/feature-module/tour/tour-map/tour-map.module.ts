import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourMapRoutingModule } from './tour-map-routing.module';
import { TourMapComponent } from './tour-map.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    TourMapComponent
  ],
  imports: [
    CommonModule,
    TourMapRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class TourMapModule { }
