import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';

const routes: Routes = [
  {
    path: '', component: UserComponent,
    children: [
      { path: 'customer-flight-booking', loadChildren: () => import('./customer-flight-booking/customer-flight-booking.module').then(m => m.CustomerFlightBookingModule) },
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'customer-hotel-booking', loadChildren: () => import('./customer-hotel-booking/customer-hotel-booking.module').then(m => m.CustomerHotelBookingModule) },
      { path: 'customer-car-booking', loadChildren: () => import('./customer-car-booking/customer-car-booking.module').then(m => m.CustomerCarBookingModule) },
      { path: 'customer-cruise-booking', loadChildren: () => import('./customer-cruise-booking/customer-cruise-booking.module').then(m => m.CustomerCruiseBookingModule) },
      { path: 'customer-tour-booking', loadChildren: () => import('./customer-tour-booking/customer-tour-booking.module').then(m => m.CustomerTourBookingModule) },
      { path: 'review', loadChildren: () => import('./review/review.module').then(m => m.ReviewModule) },
      { path: 'chat', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule) },
      { path: 'wishlist', loadChildren: () => import('./wishlist/wishlist.module').then(m => m.WishlistModule) },
      { path: 'wallet', loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletModule) },
      { path: 'payment', loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule) },
      { path: 'my-profile', loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfileModule) },
      { path: 'notification', loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule) },
      { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) },
       { path: 'profile-settings', loadChildren: () => import('./settings/profile-settings/profile-settings.module').then(m => m.ProfileSettingsModule) },
       { path: 'security-settings', loadChildren: () => import('./settings/security-settings/security-settings.module').then(m => m.SecuritySettingsModule) },
  { path: 'notification-settings', loadChildren: () => import('./settings/notification-settings/notification-settings.module').then(m => m.NotificationSettingsModule) },
  { path: 'integration-settings', loadChildren: () => import('./settings/integration-settings/integration-settings.module').then(m => m.IntegrationSettingsModule) },
    ]
  },
  
  
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
