import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ListToursRoutingModule } from './list-tours-routing.module';
import { ListToursComponent } from './list-tours.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    ListToursComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    SharedModule,
    ListToursRoutingModule
  ]
})
export class ListToursModule { } 