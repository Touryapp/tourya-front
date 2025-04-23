import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Home3RoutingModule } from './home-3-routing.module';
import { Home3Component } from './home-3.component';
import { SharedModule } from '../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';



@NgModule({
  declarations: [
    Home3Component
  ],
  imports: [
    CommonModule,
    Home3RoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class Home3Module { }
