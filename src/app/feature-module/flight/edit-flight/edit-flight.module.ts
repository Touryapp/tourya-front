import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditFlightRoutingModule } from './edit-flight-routing.module';
import { EditFlightComponent } from './edit-flight.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    EditFlightComponent
  ],
  imports: [
    CommonModule,
    EditFlightRoutingModule,
    SharedModule
  ]
})
export class EditFlightModule { }
