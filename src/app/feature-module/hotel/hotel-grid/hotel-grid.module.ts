import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotelGridRoutingModule } from './hotel-grid-routing.module';
import { HotelGridComponent } from './hotel-grid.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    HotelGridComponent
  ],
  imports: [
    CommonModule,
    HotelGridRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class HotelGridModule { }
