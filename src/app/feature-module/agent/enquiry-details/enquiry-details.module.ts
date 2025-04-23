import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnquiryDetailsRoutingModule } from './enquiry-details-routing.module';
import { EnquiryDetailsComponent } from './enquiry-details.component';
import { NgxEditorModule } from 'ngx-editor';


@NgModule({
  declarations: [
    EnquiryDetailsComponent
  ],
  imports: [
    CommonModule,
    EnquiryDetailsRoutingModule,
    NgxEditorModule
  ]
})
export class EnquiryDetailsModule { }
