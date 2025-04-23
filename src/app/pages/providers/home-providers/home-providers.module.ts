import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeProvidersRoutingModule } from './home-providers-routing.module';
import { HomeProvidersComponent } from './home-providers.component';
import { SharedModule } from '../../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';


@NgModule({
  declarations: [
    HomeProvidersComponent
  ],
  imports: [
    CommonModule,
    HomeProvidersRoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class HomeProvidersModule { }
