import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Home4RoutingModule } from './home-4-routing.module';
import { Home4Component } from './home-4.component';
import { SharedModule } from '../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';


@NgModule({
  declarations: [
    Home4Component
  ],
  imports: [
    CommonModule,
    Home4RoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class Home4Module { }
