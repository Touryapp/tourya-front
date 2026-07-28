import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeClientsComponent } from './home-clients.component';

const routes: Routes = [{ path: '', component: HomeClientsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeClientsRoutingModule { }
