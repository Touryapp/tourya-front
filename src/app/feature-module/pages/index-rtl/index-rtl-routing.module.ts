import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexRtlComponent } from './index-rtl.component';

const routes: Routes = [{ path: '', component: IndexRtlComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndexRtlRoutingModule { }
