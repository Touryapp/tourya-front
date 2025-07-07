import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { RequestprovidersRoutingModule } from './requestproviders-routing.module';
import { RequestproviderComponent } from './requestprovider.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    RequestproviderComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    SharedModule,
    RequestprovidersRoutingModule
  ]
})
export class RequestprovidersModule { } 