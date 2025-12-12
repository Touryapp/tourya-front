import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from './my-profile.component';
import { MyProfileRoutingModule } from './my-profile-routing.module';
import { SharedModule } from '../../../shared/shared-module';
import { ClientsModule } from '../clients.module';
import { ProviderTourManagementModule } from '../../providers/provider-tour-management/provider-tour-management.module';

@NgModule({
  declarations: [
    MyProfileComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MyProfileRoutingModule,
    ClientsModule,
    ProviderTourManagementModule
  ]
})
export class MyProfileModule { }
