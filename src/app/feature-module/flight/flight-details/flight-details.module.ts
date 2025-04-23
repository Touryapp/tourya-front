import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightDetailsRoutingModule } from './flight-details-routing.module';
import { FlightDetailsComponent } from './flight-details.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    FlightDetailsComponent
  ],
  imports: [
    CommonModule,
    FlightDetailsRoutingModule,
    SharedModule
  ]
})
export class FlightDetailsModule { }
