import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditHotelRoutingModule } from './edit-hotel-routing.module';
import { EditHotelComponent } from './edit-hotel.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    EditHotelComponent
  ],
  imports: [
    CommonModule,
    EditHotelRoutingModule,
    SharedModule
  ]
})
export class EditHotelModule { }
