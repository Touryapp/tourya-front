import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddCruiseRoutingModule } from './add-cruise-routing.module';
import { AddCruiseComponent } from './add-cruise.component';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    AddCruiseComponent
  ],
  imports: [
    CommonModule,
    AddCruiseRoutingModule,
    SharedModule
  ]
})
export class AddCruiseModule { }
