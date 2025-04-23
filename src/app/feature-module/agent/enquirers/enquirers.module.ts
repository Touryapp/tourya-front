import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnquirersRoutingModule } from './enquirers-routing.module';
import { EnquirersComponent } from './enquirers.component';
import { MatSortModule } from '@angular/material/sort';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { SharedModule } from '../../../shared/shared-module';


@NgModule({
  declarations: [
    EnquirersComponent
  ],
  imports: [
    CommonModule,
    EnquirersRoutingModule,
    MatSortModule,
    SharedModule,
    CustomPaginationModule,
  ]
})
export class EnquirersModule { }
