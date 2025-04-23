import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourGridRoutingModule } from './tour-grid-routing.module';
import { TourGridComponent } from './tour-grid.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    TourGridComponent
  ],
  imports: [
    CommonModule,
    TourGridRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class TourGridModule { }
