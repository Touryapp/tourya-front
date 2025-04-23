import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListingsRoutingModule } from './listings-routing.module';
import { ListingsComponent } from './listings.component';
import { HotelListingComponent } from './hotel-listing/hotel-listing.component';
import { CarListingComponent } from './car-listing/car-listing.component';
import { CruiseListingComponent } from './cruise-listing/cruise-listing.component';
import { TourListingComponent } from './tour-listing/tour-listing.component';
import { FlightListingComponent } from './flight-listing/flight-listing.component';


@NgModule({
  declarations: [
    ListingsComponent,
    HotelListingComponent,
    CarListingComponent,
    CruiseListingComponent,
    TourListingComponent,
    FlightListingComponent
  ],
  imports: [
    CommonModule,
    ListingsRoutingModule
  ]
})
export class ListingsModule { }
