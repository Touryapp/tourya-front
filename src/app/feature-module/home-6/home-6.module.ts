import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Home6RoutingModule } from './home-6-routing.module';
import { Home6Component } from './home-6.component';
import { SharedModule } from '../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';


@NgModule({
  declarations: [
    Home6Component
  ],
  imports: [
    CommonModule,
    Home6RoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class Home6Module { }
