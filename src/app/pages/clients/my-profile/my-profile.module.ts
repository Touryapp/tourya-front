import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from './my-profile.component';
import { MyProfileRoutingModule } from './my-profile-routing.module';
import { SharedModule } from '../../../shared/shared-module';
import { ClientsModule } from '../clients.module';
import { ProviderTourManagementModule } from '../../providers/provider-tour-management/provider-tour-management.module';
import { ProviderPanelModule } from '../../providers/provider-panel/provider-panel.module';
import { ClientCreditsModule } from '../client-credits/client-credits.module';
import { ListToursSharedModule } from '../list-tours/list-tours-shared.module';

@NgModule({
  declarations: [
    MyProfileComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MyProfileRoutingModule,
    ClientsModule,
    ProviderTourManagementModule,
    ProviderPanelModule,
    ClientCreditsModule,
    ListToursSharedModule
  ]
})
export class MyProfileModule { }
