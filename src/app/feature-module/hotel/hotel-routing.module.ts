import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HotelComponent } from './hotel.component';

const routes: Routes = [
  {
    path: '',
    component: HotelComponent,
    children: [
      {
        path: 'hotel-map',
        loadChildren: () =>
          import('./hotel-map/hotel-map.module').then((m) => m.HotelMapModule),
      },
      {
        path: 'hotel-list',
        loadChildren: () =>
          import('./hotel-list/hotel-list.module').then(
            (m) => m.HotelListModule
          ),
      },
      {
        path: 'hotel-grid',
        loadChildren: () =>
          import('./hotel-grid/hotel-grid.module').then(
            (m) => m.HotelGridModule
          ),
      },
      {
        path: 'hotel-details',
        loadChildren: () =>
          import('./hotel-details/hotel-details.module').then(
            (m) => m.HotelDetailsModule
          ),
      },
      {
        path: 'hotel-booking',
        loadChildren: () =>
          import('./hotel-booking/hotel-booking.module').then(
            (m) => m.HotelBookingModule
          ),
      },
      {
        path: 'add-hotel',
        loadChildren: () =>
          import('./add-hotel/add-hotel.module').then((m) => m.AddHotelModule),
      },
      {
        path: 'booking-confirmation',
        loadChildren: () =>
          import('./booking-confirmation/booking-confirmation.module').then(
            (m) => m.BookingConfirmationModule
          ),
      },
      { path: 'edit-hotel', loadChildren: () => import('./edit-hotel/edit-hotel.module').then(m => m.EditHotelModule) },
    ],
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelRoutingModule {}
