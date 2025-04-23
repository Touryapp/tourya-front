import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureModuleRoutingModule } from './feature-module-routing.module';
import { FeatureModuleComponent } from './feature-module.component';
import { SharedModule } from '../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { DefaultHeaderComponent } from './common/default-header/default-header.component';




@NgModule({
  declarations: [
    FeatureModuleComponent,
    DefaultHeaderComponent,
  ],
  imports: [
    CommonModule,
    FeatureModuleRoutingModule,
    SharedModule,
    FormsModule,
    

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FeatureModuleModule { }
