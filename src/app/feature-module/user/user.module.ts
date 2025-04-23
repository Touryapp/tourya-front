import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { CustomPaginationModule } from '../../shared/custom-pagination/custom-pagination.module';
import { SharedModule } from '../../shared/shared-module';


@NgModule({
  declarations: [
    UserComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    CustomPaginationModule,
    SharedModule
  ]
})
export class UserModule { }
