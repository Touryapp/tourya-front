import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddTourRoutingModule } from './add-tour-routing.module';
import { AddTourComponent } from './add-tour.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    AddTourComponent
  ],
  imports: [
    CommonModule,
    AddTourRoutingModule,
    SharedModule
  ]
})
export class AddTourModule { }
