import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeClientsRoutingModule } from './home-clients-routing.module';
import { HomeClientsComponent } from './home-clients.component';
import { SharedModule } from '../../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';


@NgModule({
  declarations: [
    HomeClientsComponent
  ],
  imports: [
    CommonModule,
    HomeClientsRoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class HomeClientsModule { }
