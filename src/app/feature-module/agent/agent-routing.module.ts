import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentComponent } from './agent.component';

const routes: Routes = [
  {
    path: '',
    component: AgentComponent,
    children: [
      {
        path: 'reviews',
        loadChildren: () =>
          import('./review/review.module').then((m) => m.ReviewModule),
      },
      { path: 'hotel-booking', loadChildren: () => import('./hotel-bookings/hotel-bookings.module').then(m => m.HotelBookingsModule) },
      { path: 'settings', loadChildren: () => import('./settings/setting/setting.module').then(m => m.SettingModule) },
      { path: 'account-settings', loadChildren: () => import('./settings/account-settings/account-settings.module').then(m => m.AccountSettingsModule) },
      { path: 'security-settings', loadChildren: () => import('./settings/security-settings/security-settings.module').then(m => m.SecuritySettingsModule) },
      { path: 'plans-settings', loadChildren: () => import('./settings/plans-settings/plans-settings.module').then(m => m.PlansSettingsModule) },
      { path: 'agent-dashboard', loadChildren: () => import('./agent-dashboard/agent-dashboard.module').then(m => m.AgentDashboardModule) },
      { path: 'flight-booking', loadChildren: () => import('./flight-booking/flight-booking.module').then(m => m.FlightBookingModule) },
      { path: 'car-booking', loadChildren: () => import('./car-booking/car-booking.module').then(m => m.CarBookingModule) },
      { path: 'cruise-booking', loadChildren: () => import('./cruise-booking/cruise-booking.module').then(m => m.CruiseBookingModule) },
      { path: 'tour-booking', loadChildren: () => import('./tour-booking/tour-booking.module').then(m => m.TourBookingModule) },
      { path: 'listings', loadChildren: () => import('./listings/listings.module').then(m => m.ListingsModule) },
      { path: 'enquirers', loadChildren: () => import('./enquirers/enquirers.module').then(m => m.EnquirersModule) },
      { path: 'earnings', loadChildren: () => import('./earnings/earnings.module').then(m => m.EarningsModule) },
      { path: 'agent-notification', loadChildren: () => import('./agent-notification/agent-notification.module').then(m => m.AgentNotificationModule) },
    ],
  },
  
  { path: 'agent-chat', loadChildren: () => import('./agent-chat/agent-chat.module').then(m => m.AgentChatModule) },
  { path: 'enquiry-details', loadChildren: () => import('./enquiry-details/enquiry-details.module').then(m => m.EnquiryDetailsModule) },
  { path: 'plans-billings', loadChildren: () => import('./settings/plans-billings/plans-billings.module').then(m => m.PlansBillingsModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentRoutingModule {}
