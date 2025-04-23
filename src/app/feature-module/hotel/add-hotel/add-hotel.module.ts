import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddHotelRoutingModule } from './add-hotel-routing.module';
import { AddHotelComponent } from './add-hotel.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    AddHotelComponent
  ],
  imports: [
    CommonModule,
    AddHotelRoutingModule,
    SharedModule
  ]
})
export class AddHotelModule { }
