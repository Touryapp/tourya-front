import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddFlightRoutingModule } from './add-flight-routing.module';
import { AddFlightComponent } from './add-flight.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    AddFlightComponent
  ],
  imports: [
    CommonModule,
    AddFlightRoutingModule,
    SharedModule
  ]
})
export class AddFlightModule { }
