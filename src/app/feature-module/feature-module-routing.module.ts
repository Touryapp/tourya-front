import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureModuleComponent } from './feature-module.component';

const routes: Routes = [
  {
    path: '',
    component: FeatureModuleComponent,
    children: [
      { path: 'index', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
      { path: 'index-2', loadChildren: () => import('./home-2/home-2.module').then(m => m.Home2Module) },
      { path: 'index-3', loadChildren: () => import('./home-3/home-3.module').then(m => m.Home3Module) },
      { path: 'index-4', loadChildren: () => import('./home-4/home-4.module').then(m => m.Home4Module) },
      { path: 'index-5', loadChildren: () => import('./home-5/home-5.module').then(m => m.Home5Module) },
      { path: 'index-6', loadChildren: () => import('./home-6/home-6.module').then(m => m.Home6Module) },
      { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
      { path: 'hotel', loadChildren: () => import('./hotel/hotel.module').then(m => m.HotelModule) },
      { path: 'car', loadChildren: () => import('./car/car.module').then(m => m.CarModule) },
      { path: 'flight', loadChildren: () => import('./flight/flight.module').then(m => m.FlightModule) },
      { path: 'cruise', loadChildren: () => import('./cruise/cruise.module').then(m => m.CruiseModule) },
      { path: 'pages', loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule) },
      { path: 'tour', loadChildren: () => import('./tour/tour.module').then(m => m.TourModule) },
      { path: 'agent', loadChildren: () => import('./agent/agent.module').then(m => m.AgentModule) },
      ],
  },
  
 
  
  



  
  

  
  
  
  

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeatureModuleRoutingModule {}
