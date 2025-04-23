import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddCarRoutingModule } from './add-car-routing.module';
import { AddCarComponent } from './add-car.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    AddCarComponent
  ],
  imports: [
    CommonModule,
    AddCarRoutingModule,
    SharedModule
  ]
})
export class AddCarModule { }
