import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotelListRoutingModule } from './hotel-list-routing.module';
import { HotelListComponent } from './hotel-list.component';
import { SharedModule } from '../../../shared/shared-module';
import { Slider } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { SliderModule } from 'primeng/slider';

@NgModule({
  declarations: [
    HotelListComponent
  ],
  imports: [
    CommonModule,
    HotelListRoutingModule,
    SharedModule,
    Slider,
    FormsModule,
    MatSliderModule,
    CustomPaginationModule
  ]
})
export class HotelListModule { }
