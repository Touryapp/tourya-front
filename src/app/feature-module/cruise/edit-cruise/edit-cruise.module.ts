import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditCruiseRoutingModule } from './edit-cruise-routing.module';
import { EditCruiseComponent } from './edit-cruise.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    EditCruiseComponent
  ],
  imports: [
    CommonModule,
    EditCruiseRoutingModule,
    SharedModule
  ]
})
export class EditCruiseModule { }
