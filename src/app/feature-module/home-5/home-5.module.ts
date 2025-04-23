import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Home5RoutingModule } from './home-5-routing.module';
import { Home5Component } from './home-5.component';
import { SharedModule } from '../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';


@NgModule({
  declarations: [
    Home5Component
  ],
  imports: [
    CommonModule,
    Home5RoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class Home5Module { }
