import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeProvidersComponent } from './home-providers.component';

const routes: Routes = [{ path: '', component: HomeProvidersComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeProvidersRoutingModule { }
