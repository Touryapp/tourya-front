import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProviderReviewsComponent } from './provider-reviews.component';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  declarations: [
    ProviderReviewsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    ProviderReviewsComponent
  ]
})
export class ProviderReviewsModule { }
