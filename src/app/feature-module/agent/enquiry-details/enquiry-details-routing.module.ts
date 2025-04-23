import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnquiryDetailsComponent } from './enquiry-details.component';

const routes: Routes = [{ path: '', component: EnquiryDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnquiryDetailsRoutingModule { }
