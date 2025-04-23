import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnquirersComponent } from './enquirers.component';

const routes: Routes = [{ path: '', component: EnquirersComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnquirersRoutingModule { }
