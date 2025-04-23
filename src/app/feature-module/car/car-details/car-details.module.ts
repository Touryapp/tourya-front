import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarDetailsRoutingModule } from './car-details-routing.module';
import { CarDetailsComponent } from './car-details.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    CarDetailsComponent
  ],
  imports: [
    CommonModule,
    CarDetailsRoutingModule,
    SharedModule
  ]
})
export class CarDetailsModule { }
