import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourAdminRoutingModule } from './tour-admin-routing.module';
import { TourAdminListComponent } from './tour-admin-list/tour-admin-list.component';
import { TourAdminDetailComponent } from './tour-admin-detail/tour-admin-detail.component';
import { SharedModule } from '../../../shared/shared-module';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [
    TourAdminListComponent,
    TourAdminDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    GoogleMapsModule,
    TourAdminRoutingModule
  ]
  ,
  exports: [
    TourAdminListComponent,
    TourAdminDetailComponent
  ]
})
export class TourAdminModule { }
