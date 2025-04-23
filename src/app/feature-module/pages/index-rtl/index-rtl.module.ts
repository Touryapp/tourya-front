import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexRtlRoutingModule } from './index-rtl-routing.module';
import { IndexRtlComponent } from './index-rtl.component';
import { SharedModule } from '../../../shared/shared-module';
import { CountUpModule } from 'ngx-countup';


@NgModule({
  declarations: [
    IndexRtlComponent
  ],
  imports: [
    CommonModule,
    IndexRtlRoutingModule,
    SharedModule,
    CountUpModule
  ]
})
export class IndexRtlModule { }
