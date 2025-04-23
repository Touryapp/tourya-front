import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightComponent } from './flight.component';

const routes: Routes = [
  { path: '', 
    component: FlightComponent,
    children:[
      { path: 'flight-list', loadChildren: () => import('./flight-list/flight-list.module').then(m => m.FlightListModule) },
      { path: 'flight-grid', loadChildren: () => import('./flight-grid/flight-grid.module').then(m => m.FlightGridModule) },
      { path: 'flight-details', loadChildren: () => import('./flight-details/flight-details.module').then(m => m.FlightDetailsModule) },
      { path: 'flight-booking-confirmation', loadChildren: () => import('./flight-booking-confirmation/flight-booking-confirmation.module').then(m => m.FlightBookingConfirmationModule) },
      { path: 'add-flight', loadChildren: () => import('./add-flight/add-flight.module').then(m => m.AddFlightModule) },
      { path: 'flight-booking', loadChildren: () => import('./flight-booking/flight-booking.module').then(m => m.FlightBookingModule) },
      { path: 'edit-flight', loadChildren: () => import('./edit-flight/edit-flight.module').then(m => m.EditFlightModule) },
    ]
   },
  


  
  
   ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightRoutingModule { }
