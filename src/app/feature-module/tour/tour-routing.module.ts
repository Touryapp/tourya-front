import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourComponent } from './tour.component';

const routes: Routes = [
  { path: '', 
    component: TourComponent,
    children:[
      { path: 'tour-list', loadChildren: () => import('./tour-list/tour-list.module').then(m => m.TourListModule) },
      { path: 'tour-grid', loadChildren: () => import('./tour-grid/tour-grid.module').then(m => m.TourGridModule) },
      { path: 'tour-map', loadChildren: () => import('./tour-map/tour-map.module').then(m => m.TourMapModule) },
      { path: 'tour-details', loadChildren: () => import('./tour-details/tour-details.module').then(m => m.TourDetailsModule) },
      { path: 'tour-booking-confirmation', loadChildren: () => import('./tour-booking-confirmation/tour-booking-confirmation.module').then(m => m.TourBookingConfirmationModule) },
      { path: 'add-tour', loadChildren: () => import('./add-tour/add-tour.module').then(m => m.AddTourModule) },
      { path: 'tour-booking', loadChildren: () => import('./tour-booking/tour-booking.module').then(m => m.TourBookingModule) },
  { path: 'edit-tour', loadChildren: () => import('./edit-tour/edit-tour.module').then(m => m.EditTourModule) },
    ]
   },
  
 
  
  
   ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourRoutingModule { }
