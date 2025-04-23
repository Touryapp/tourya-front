import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourListRoutingModule } from './tour-list-routing.module';
import { TourListComponent } from './tour-list.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    TourListComponent
  ],
  imports: [
    CommonModule,
    TourListRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class TourListModule { }
