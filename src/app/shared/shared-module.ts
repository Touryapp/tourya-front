import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LightboxModule } from 'ngx-lightbox';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { LightgalleryModule } from 'lightgallery/angular';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { NgxEditorModule } from 'ngx-editor';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DateRangePickerModule } from '../feature-module/common/date-range-picker/date-range-picker.module';
import { FooterComponent } from '../feature-module/common/footer/footer.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CommonCounterComponent } from '../feature-module/common/common-counter/common-counter.component';
import { DatePicker } from 'primeng/datepicker';
import { GoogleMapsModule } from '@angular/google-maps';
import { UserDashboardComponent } from '../feature-module/common/user-dashboard/user-dashboard.component';

@NgModule({
  declarations: [FooterComponent,CommonCounterComponent, UserDashboardComponent],
  imports: [
    CommonModule,
    NgScrollbarModule,
    MatTooltipModule,
    LightboxModule,
    CarouselModule,
    BsDatepickerModule.forRoot(),
    LightgalleryModule,
    MatSelectModule,
    MatSortModule,
    NgScrollbarModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgApexchartsModule,
    TooltipModule.forRoot(),
    ToastModule,
    NgxEditorModule,
    PopoverModule,
    GoogleMapsModule,
    DateRangePickerModule,
    FormsModule,
    FullCalendarModule,
    CalendarModule,
    DatePicker,
    SlickCarouselModule
  ],
  exports: [
    CommonModule,
    NgScrollbarModule,
    MatTooltipModule,
    LightboxModule,
    CarouselModule,
    BsDatepickerModule,
    LightgalleryModule,
    MatSelectModule,
    MatSortModule,
    NgScrollbarModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgApexchartsModule,
    TooltipModule,
    ToastModule,
    NgxEditorModule,
    PopoverModule,
    CommonCounterComponent,
    DateRangePickerModule,
    UserDashboardComponent,
    FooterComponent,
    FormsModule,
    FullCalendarModule,
    DatePicker,
    CalendarModule,
    SlickCarouselModule
  ],
  providers: [
    provideNgxMask(),
    DatePipe,
    BsDatepickerConfig,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class SharedModule {}
