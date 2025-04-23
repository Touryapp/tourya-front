import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotelDetailsRoutingModule } from './hotel-details-routing.module';
import { HotelDetailsComponent } from './hotel-details.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    HotelDetailsComponent
  ],
  imports: [
    CommonModule,
    HotelDetailsRoutingModule,
    SharedModule
  ]
})
export class HotelDetailsModule { }
