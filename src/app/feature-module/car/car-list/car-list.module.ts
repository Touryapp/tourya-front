import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarListRoutingModule } from './car-list-routing.module';
import { CarListComponent } from './car-list.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    CarListComponent
  ],
  imports: [
    CommonModule,
    CarListRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class CarListModule { }
