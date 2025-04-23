import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightRoutingModule } from './flight-routing.module';
import { FlightComponent } from './flight.component';
import { SharedModule } from '../../shared/shared-module';


@NgModule({
  declarations: [
    FlightComponent
  ],
  imports: [
    CommonModule,
    FlightRoutingModule,
    SharedModule
  ]
})
export class FlightModule { }
