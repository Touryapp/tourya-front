import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Home2RoutingModule } from './home-2-routing.module';
import { Home2Component } from './home-2.component';
import { DefaultHeaderComponent } from '../common/default-header/default-header.component';
import { SharedModule } from '../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';


@NgModule({
  declarations: [
    Home2Component,
    
  ],
  imports: [
    CommonModule,
    Home2RoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class Home2Module { }
