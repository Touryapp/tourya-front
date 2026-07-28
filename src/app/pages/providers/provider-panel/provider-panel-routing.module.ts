import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderPanelComponent } from './provider-panel.component';

const routes: Routes = [
  {
    path: '',
    component: ProviderPanelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderPanelRoutingModule { } 