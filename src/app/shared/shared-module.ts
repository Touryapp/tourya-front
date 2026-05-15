import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgScrollbarModule } from "ngx-scrollbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgApexchartsModule } from "ng-apexcharts";
import { LightboxModule } from "ngx-lightbox";
import { CarouselModule } from "ngx-owl-carousel-o";
import {
  BsDatepickerModule,
  BsDatepickerConfig,
} from "ngx-bootstrap/datepicker";
import { LightgalleryModule } from "lightgallery/angular";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ToastModule } from "primeng/toast";
import { CalendarModule } from "primeng/calendar";
import { NgxEditorModule } from "ngx-editor";
import { PopoverModule } from "ngx-bootstrap/popover";
import { DateRangePickerModule } from "../feature-module/common/date-range-picker/date-range-picker.module";
import { FullCalendarModule } from "@fullcalendar/angular";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { CommonCounterComponent } from "../feature-module/common/common-counter/common-counter.component";
import { DatePicker } from "primeng/datepicker";
import { GoogleMapsModule } from "@angular/google-maps";
import { UserDashboardComponent } from "../feature-module/common/user-dashboard/user-dashboard.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { BsModalService, ModalModule } from "ngx-bootstrap/modal";
import { SafeHtmlPipe } from "./pipe/safe-html.pipe";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TranslateModule } from "@ngx-translate/core";
import { FloatingCartComponent } from "./common/floating-cart/floating-cart.component";
import { FooterComponent } from "./common/footer/footer.component";
import { ConfirmDialogComponent } from "./common/confirm-dialog/confirm-dialog.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
// Calendar
import {
  CalendarModule as CalendarAngularCalendarModule,
  DateAdapter,
} from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { MatOptionModule } from "@angular/material/core";
import { TourSlotSelectionModalComponent } from "./common/tour-slot-selection-modal/tour-slot-selection-modal.component";
import { PendingReviewsModalComponent } from "./components/pending-reviews-modal/pending-reviews-modal.component";
@NgModule({
  declarations: [
    FooterComponent,
    FloatingCartComponent,
    CommonCounterComponent,
    UserDashboardComponent,
    ConfirmDialogComponent,
    PendingReviewsModalComponent
  ],
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
    SlickCarouselModule,
    MatSlideToggleModule,
    ModalModule,
    SafeHtmlPipe,
    MatSnackBarModule,
    DragDropModule,
    TranslateModule,
    MatCheckboxModule,
    CalendarAngularCalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MatOptionModule,
    RouterModule,
  ],
  exports: [
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
    FloatingCartComponent,
    DateRangePickerModule,
    UserDashboardComponent,
    FooterComponent,
    FormsModule,
    FullCalendarModule,
    DatePicker,
    CalendarModule,
    SlickCarouselModule,
    MatSlideToggleModule,
    ModalModule,
    SafeHtmlPipe,
    MatSnackBarModule,
    DragDropModule,
    TranslateModule,
    ConfirmDialogComponent,
    MatCheckboxModule,
    CalendarAngularCalendarModule,
    PendingReviewsModalComponent,
    GoogleMapsModule,
    RouterModule
  ],
  providers: [
    provideNgxMask(),
    DatePipe,
    BsDatepickerConfig,
    BsModalService,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class SharedModule {}
