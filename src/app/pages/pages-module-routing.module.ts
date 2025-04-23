import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesModuleComponent } from './pages-module.component';

const routes: Routes = [
  {
    path: '',
    component: PagesModuleComponent,
    children: [
        { path: 'home', loadChildren: () => import('../feature-module/home/home.module').then(m => m.HomeModule) },
      ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesModuleRoutingModule {}
