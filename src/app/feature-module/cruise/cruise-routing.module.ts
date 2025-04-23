import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CruiseComponent } from './cruise.component';

const routes: Routes = [
  { path: '', 
    component: CruiseComponent,
    children:[
      { path: 'cruise-list', loadChildren: () => import('./cruise-list/cruise-list.module').then(m => m.CruiseListModule) },
      { path: 'cruise-grid', loadChildren: () => import('./cruise-grid/cruise-grid.module').then(m => m.CruiseGridModule) },
      { path: 'cruise-map', loadChildren: () => import('./cruise-map/cruise-map.module').then(m => m.CruiseMapModule) },
      { path: 'cruise-details', loadChildren: () => import('./cruise-details/cruise-details.module').then(m => m.CruiseDetailsModule) },
      { path: 'cruise-booking-confirmation', loadChildren: () => import('./cruise-booking-confirmation/cruise-booking-confirmation.module').then(m => m.CruiseBookingConfirmationModule) },
      { path: 'add-cruise', loadChildren: () => import('./add-cruise/add-cruise.module').then(m => m.AddCruiseModule) },
      { path: 'cruise-booking', loadChildren: () => import('./cruise-booking/cruise-booking.module').then(m => m.CruiseBookingModule) },
      { path: 'edit-cruise', loadChildren: () => import('./edit-cruise/edit-cruise.module').then(m => m.EditCruiseModule) },
    ] 
  },
  
  
  
  

   ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CruiseRoutingModule { }
