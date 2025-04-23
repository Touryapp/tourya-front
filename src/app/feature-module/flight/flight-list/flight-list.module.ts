import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightListRoutingModule } from './flight-list-routing.module';
import { FlightListComponent } from './flight-list.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    FlightListComponent
  ],
  imports: [
    CommonModule,
    FlightListRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class FlightListModule { }
