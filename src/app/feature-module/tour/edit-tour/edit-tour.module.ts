import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditTourRoutingModule } from './edit-tour-routing.module';
import { EditTourComponent } from './edit-tour.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    EditTourComponent
  ],
  imports: [
    CommonModule,
    EditTourRoutingModule,
    SharedModule
  ]
})
export class EditTourModule { }
