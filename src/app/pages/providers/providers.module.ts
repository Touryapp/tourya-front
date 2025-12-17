import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProvidersRoutingModule } from "./providers-routing.module";
import { ProvidersComponent } from "./providers.component";
import { HomeComponent } from "./home/home.component";
import { SharedModule } from "../../shared/shared-module";
import { CountUpModule } from "ngx-countup";
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  declarations: [ProvidersComponent, HomeComponent, QrScannerComponent],
  imports: [CommonModule, SharedModule, ProvidersRoutingModule, CountUpModule, ZXingScannerModule],
})
export class ProvidersModule {}
