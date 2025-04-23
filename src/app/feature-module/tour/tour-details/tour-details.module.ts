import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourDetailsRoutingModule } from './tour-details-routing.module';
import { TourDetailsComponent } from './tour-details.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    TourDetailsComponent
  ],
  imports: [
    CommonModule,
    TourDetailsRoutingModule,
    SharedModule
  ]
})
export class TourDetailsModule { }
