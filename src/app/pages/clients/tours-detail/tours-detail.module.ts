import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToursDetailRoutingModule } from './tours-detail-routing.module';
import { ToursDetailComponent } from './tours-detail.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    ToursDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ToursDetailRoutingModule
  ]
})
export class ToursDetailModule { } 