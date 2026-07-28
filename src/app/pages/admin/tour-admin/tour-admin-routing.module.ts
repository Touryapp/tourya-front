import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourAdminListComponent } from './tour-admin-list/tour-admin-list.component';
import { TourAdminDetailComponent } from './tour-admin-detail/tour-admin-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TourAdminListComponent
  },
  {
    path: 'detail/:id',
    component: TourAdminDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourAdminRoutingModule { }
