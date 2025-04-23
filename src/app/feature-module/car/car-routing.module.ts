import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarComponent } from './car.component';

const routes: Routes = [
  { path: '', 
    component: CarComponent,
    children:[
      { path: 'car-list', loadChildren: () => import('./car-list/car-list.module').then(m => m.CarListModule) },
      { path: 'car-grid', loadChildren: () => import('./car-grid/car-grid.module').then(m => m.CarGridModule) },
      { path: 'car-details', loadChildren: () => import('./car-details/car-details.module').then(m => m.CarDetailsModule) },
      { path: 'car-map', loadChildren: () => import('./car-map/car-map.module').then(m => m.CarMapModule) },
      { path: 'car-booking-confirmation', loadChildren: () => import('./car-booking-confirmation/car-booking-confirmation.module').then(m => m.CarBookingConfirmationModule) },
      { path: 'add-car', loadChildren: () => import('./add-car/add-car.module').then(m => m.AddCarModule) },
      { path: 'car-booking', loadChildren: () => import('./car-booking/car-booking.module').then(m => m.CarBookingModule) },
      { path: 'edit-car', loadChildren: () => import('./edit-car/edit-car.module').then(m => m.EditCarModule) },
    ]
   },
  
  
  
  
  
  
   ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarRoutingModule { }
