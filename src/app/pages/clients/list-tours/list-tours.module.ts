import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ListToursRoutingModule } from './list-tours-routing.module';
import { ListToursComponent } from './list-tours.component';
import { SharedModule } from '../../../shared/shared-module';
import { TourListViewComponent } from './tour-list-view/tour-list-view.component';
import { TourGridViewComponent } from './tour-grid-view/tour-grid-view.component';

@NgModule({
  declarations: [
    ListToursComponent,
    TourListViewComponent,
    TourGridViewComponent
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