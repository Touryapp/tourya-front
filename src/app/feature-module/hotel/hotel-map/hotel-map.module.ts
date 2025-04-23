import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotelMapRoutingModule } from './hotel-map-routing.module';
import { HotelMapComponent } from './hotel-map.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    HotelMapComponent
  ],
  imports: [
    CommonModule,
    HotelMapRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class HotelMapModule { }
