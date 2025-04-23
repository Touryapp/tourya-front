import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CruiseListRoutingModule } from './cruise-list-routing.module';
import { CruiseListComponent } from './cruise-list.component';
import { SharedModule } from '../../../shared/shared-module';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [
    CruiseListComponent
  ],
  imports: [
    CommonModule,
    CruiseListRoutingModule,
    SharedModule,
    MatSliderModule
  ]
})
export class CruiseListModule { }
