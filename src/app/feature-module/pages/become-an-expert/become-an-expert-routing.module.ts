import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BecomeAnExpertComponent } from './become-an-expert.component';

const routes: Routes = [{ path: '', component: BecomeAnExpertComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BecomeAnExpertRoutingModule { }
