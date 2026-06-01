import { Component, ElementRef, HostListener, NgZone, ViewChild, ViewEncapsulation } from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { ActivatedRoute, Router } from "@angular/router";
import { TypeOfPersonLabel } from "../../../../shared/enums/type-of-person.enum";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { TourService } from "../tour.service";
import { Tour } from "../../../../shared/dto/tour-response.dto";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TourSchedule } from "../../../../shared/dto/tour-schedule.response.dto";
import { dayjsDateValidator } from "../../../../shared/validators/date-format.validator";
import { onlyNumberValidator } from "../../../../shared/validators/only-number.validator";
import dayjs from "dayjs";
import { endOfDay, isSameDay, isSameMonth, startOfDay } from "date-fns";
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from "angular-calendar";
import { Subject } from "rxjs";
import { TemplateService } from "../../templates/template.service";
import { AuthService } from "../../../../core/services/auth.service";
import { TourScheduleConfigResponseDto } from "../../../../shared/dto/tour-schedule.response.dto";
import { I18nFieldService } from "../../../../shared/services/i18n-field.service";
@Component({
  selector: "app-tour-schedule-test",
  standalone: false,
  templateUrl: "./tour-schedule-test.component.html",
  styleUrl: "./tour-schedule-test.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class TourScheduleTestComponent {
  @ViewChild("calendarContainer") calendarContainer!: ElementRef;
  public routes = routes;
  loading = false;
  tourScheduleForm: FormGroup;
  readonly TypeOfPersonLabel = TypeOfPersonLabel;

  tourId: number = 0;
  tour: Tour | null = null;
  tourSchedules: TourScheduleConfigResponseDto[] = [];
  tourSchedule: TourSchedule | null = null;
  tourScheduleId: number = 0;

  submitted: boolean = false;

  errorMessage: string = "";

  bsValueStartDate = undefined;
  bsValueEndDate = undefined;
  minDateStartDate: Date = dayjs()
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate();
  minDateEndDate: Date | undefined = undefined;
  maxDateEndDate: Date | undefined = undefined;

  DAYS_OF_WEEK = [
    { label: "SUNDAY", value: "SUNDAY", day: 0 },
    { label: "MONDAY", value: "MONDAY", day: 1 },
    { label: "TUESDAY", value: "TUESDAY", day: 2 },
    { label: "WEDNESDAY", value: "WEDNESDAY", day: 3 },
    { label: "THURSDAY", value: "THURSDAY", day: 4 },
    { label: "FRIDAY", value: "FRIDAY", day: 5 },
    { label: "SATURDAY", value: "SATURDAY", day: 6 },
  ];

  // Legacy calendar state (kept for compatibility with inherited methods)
  viewDate: Date = dayjs().hour(0).minute(0).second(0).millisecond(0).toDate();
  activeDayIsOpen: boolean = false;
  eventsOnSelectedDay: any[] = [];
  events: any[] = [];
  refresh = new Subject<void>();

  // Inline datepicker (bs-datepicker-inline) - rango de fechas
  inlineDateValue: Date[] = [];
  
  // Rango para el popup de doble calendario (Start/End Date)
  bsRangeValue: Date[] | undefined = [new Date(), new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)];

  allMonthSelected: boolean = false;

  // Propiedades para templates
  templates: TourSchedule[] = [];
  selectedTemplateId: number | null = null;
  selectedTemplate: TourSchedule | null = null;
  templatesLoading = false;

  // Modal para conversión ANY a ADULT
  showAnyModal = false;
  pendingSlotIndex: number | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tourService: TourService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private templateService: TemplateService,
    private authService: AuthService,
    public i18nService: I18nFieldService,
    private ngZone: NgZone
  ) {
    this.tourId = +(this.route.snapshot.paramMap.get("id") || 0);

    this.tourScheduleForm = this.fb.group({
      label: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      startDate: ["", [Validators.required, dayjsDateValidator("DD-MM-YYYY")]],
      endDate: ["", [Validators.required, dayjsDateValidator("DD-MM-YYYY")]],
      daysOfWeek: this.fb.array([]),

      slots: this.fb.array([]),
    });

    if (this.tourId > 0) {
      this.getTour();
      this.getSchedules();
      this.addSlot();
      this.loadTemplates();
    } else {
      this.router.navigate(["/providers/provider-panel"]);
    }
  }

  get isGroupTour(): boolean {
    return this.tour?.priceType === 'group';
  }

  onSubmit() {
    this.loading = true;
    this.submitted = true;
    this.tourScheduleForm.markAllAsTouched();
    this.daysOfWeek.markAllAsTouched();
    this.daysOfWeek.markAsDirty();

    if (this.daysOfWeek.length === 0) {
      this.tourScheduleForm.get("daysOfWeek")?.setErrors({ required: true });
    }

    if (this.tourScheduleForm.valid) {
      if (this.tourScheduleId) {
        this.updateTourSchedule();
      } else {
        // Si hay fechas seleccionadas, usar batch save
        const startDate = this.tourScheduleForm.get("startDate")?.value;
        const endDate = this.tourScheduleForm.get("endDate")?.value;
        
        if (startDate && endDate) {
          this.saveTourScheduleBatch();
        } else {
          this.saveTourSchedule();
        }
      }
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.tourScheduleForm
      .get("startDate")
      ?.valueChanges.subscribe((startDate) => {
        const startDateDayJs = dayjs(startDate);
        this.minDateEndDate = startDate;

        const lastDayOfMonth = startDateDayJs.endOf("month");
        this.maxDateEndDate = lastDayOfMonth.toDate();

        const endDateControl = this.tourScheduleForm.get("endDate");
        const endDate = endDateControl?.value;
        const endDateDayJs = dayjs(endDate);

        if (
          (endDate && startDateDayJs.isAfter(endDateDayJs)) ||
          endDateDayJs.isAfter(lastDayOfMonth)
        ) {
          endDateControl?.setErrors({
            invalidRangeDate: true,
          });
        }

        this.checkAllMonthSelected();
        this.checkTourScheduleByStartDateAndEndDate();
      });

    this.tourScheduleForm.get("endDate")?.valueChanges.subscribe((endDate) => {
      this.checkAllMonthSelected();
      this.checkTourScheduleByStartDateAndEndDate();
    });



    this.slots.valueChanges.subscribe((value) => {
      // Age and capacity validation removed
    });
  }

  private _captureClickBound?: (e: Event) => void;

  ngAfterViewInit(): void {
    // Use capture phase so we see the click BEFORE bs-daterangepicker-inline
    // calls stopPropagation internally.
    this._captureClickBound = (e: Event) => {
      this.ngZone.run(() => this.onCalendarClick(e as MouseEvent));
    };
    document.addEventListener('click', this._captureClickBound, true);
  }

  ngOnDestroy(): void {
    if (this._captureClickBound) {
      document.removeEventListener('click', this._captureClickBound, true);
    }
  }

  onPriceBlur(indexSlot: number, indexPrice: number) {
    const priceControl = this.prices(indexSlot).at(indexPrice).get("providerPrice");
    const price = priceControl?.value;

    let displayPrice: number = 0;
    if (price) {
      displayPrice = parseFloat(price);
    }
    priceControl?.setValue(displayPrice);
  }

  onLabelBlur(event: FocusEvent) {
    this.tourScheduleForm
      .get("label")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onStartTimeBlur(index: number) {
    this.checkTimeRange(index);
  }

  onEndTimeBlur(index: number) {
    this.checkTimeRange(index);
  }

  onKeypressStartDatePicker(event: KeyboardEvent) {
    return false;
  }

  onKeydownStartDatePicker(event: KeyboardEvent) {
    if (event.key === "Backspace") {
      this.tourScheduleForm.get("startDate")?.setValue("");
    }
  }

  onKeypressEndDatePicker(event: KeyboardEvent) {
    return false;
  }

  onKeydownEndDatePicker(event: KeyboardEvent) {
    if (event.key === "Backspace") {
      this.tourScheduleForm.get("endDate")?.setValue("");
      this.bsRangeValue = undefined;
    }
  }

  onFormDateRangeChange(event: any): void {
    if (Array.isArray(event) && event.length === 2 && event[0] instanceof Date && event[1] instanceof Date) {
      const startDateControl = this.tourScheduleForm.get('startDate');
      const endDateControl = this.tourScheduleForm.get('endDate');

      const currentStart = startDateControl?.value instanceof Date ? startDateControl.value.getTime() : null;
      const currentEnd = endDateControl?.value instanceof Date ? endDateControl.value.getTime() : null;
      
      if (currentStart !== event[0].getTime() || currentEnd !== event[1].getTime()) {
        startDateControl?.setValue(event[0]);
        endDateControl?.setValue(event[1]);
        this.inlineDateValue = [event[0], event[1]];
        this.bsRangeValue = [event[0], event[1]];
      }
    } else {
      this.bsRangeValue = undefined;
    }
  }

  checkTimeRange(index: number) {
    const day = dayjs();
    const startTimeControl = this.slots.at(index).get("startTime");
    const endTimeControl = this.slots.at(index).get("endTime");

    const startTime = startTimeControl?.value;
    const endTime = endTimeControl?.value;

    if (startTime && endTime) {
      const startTimeSplit = startTime.split(":");
      const endtimeSplit = endTime.split(":");

      const startTimeMoment = day
        .hour(startTimeSplit[0])
        .minute(startTimeSplit[1]);

      const endTimeMoment = day.hour(endtimeSplit[0]).minute(endtimeSplit[1]);

      if (startTimeMoment.isAfter(endTimeMoment)) {
        endTimeControl?.setErrors({
          invalidRangeTime: true,
        });
      }
    }
  }

  get slots(): FormArray {
    return this.tourScheduleForm.get("slots") as FormArray;
  }

  newSlot(): FormGroup {
    return this.fb.group({
      id: ["", []],
      startTime: ["", [Validators.required]],
      endTime: ["", [Validators.required]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      prices: this.fb.array([]),
    });
  }

  addSlot() {
    if (this.slots.valid) {
      this.slots.push(this.newSlot());
      const newPriceGroup = this.newPrice();
      if (this.isGroupTour) {
        newPriceGroup.get('ageType')?.setValue(TypeOfPersonLabel.ANY);
      }
      this.prices(this.slots.length - 1).push(newPriceGroup);
    } else {
      this.slots.markAllAsTouched();
    }
  }

  removeSlot(index: number) {
    this.slots.removeAt(index);
    this.slots.markAsDirty();
  }

  prices(index: number): FormArray {
    return this.slots.at(index).get("prices") as FormArray;
  }

  newPrice(): FormGroup {
    return this.fb.group({
      id: ["", []],
      ageType: ["", [Validators.required]],
      providerPrice: ["", [Validators.required, Validators.min(0)]],
    });
  }

  addPrice(index: number) {
    if (this.isGroupTour) {
      return; // Do not allow multiple prices for group tours
    }

    // Check if first price has ANY selected
    const firstPrice = this.prices(index).at(0);
    if (firstPrice && firstPrice.get('ageType')?.value === TypeOfPersonLabel.ANY) {
      // Show modal to confirm conversion from ANY to ADULT
      this.pendingSlotIndex = index;
      this.showAnyModal = true;
      return;
    }

    if (this.prices(index).valid) {
      this.prices(index).push(this.newPrice());
    } else {
      this.prices(index).markAllAsTouched();
    }
  }

  confirmAnyToAdultConversion() {
    if (this.pendingSlotIndex !== null) {
      const firstPrice = this.prices(this.pendingSlotIndex).at(0);
      if (firstPrice) {
        // Convert ANY to ADULT
        firstPrice.get('ageType')?.setValue(TypeOfPersonLabel.ADULT);
        // Add new price
        this.prices(this.pendingSlotIndex).push(this.newPrice());
      }
    }
    this.closeAnyModal();
  }

  closeAnyModal() {
    this.showAnyModal = false;
    this.pendingSlotIndex = null;
  }

  removePrice(indexSlot: number, indexPrice: number) {
    this.prices(indexSlot).removeAt(indexPrice);
    this.prices(indexSlot).markAsDirty();
  }

  get daysOfWeek() {
    return this.tourScheduleForm.get("daysOfWeek") as FormArray;
  }

  onDayChange(day: string, event: any): void {
    this.daysOfWeek.markAllAsTouched();
    this.daysOfWeek.markAsDirty();

    if (event.checked) {
      this.daysOfWeek.push(new FormControl(day));
    } else {
      this.daysOfWeek.controls.forEach((control: AbstractControl, index) => {
        if (control.value === day) {
          this.daysOfWeek.removeAt(index);
          return;
        }
      });

      if (this.daysOfWeek.length === 0) {
        this.tourScheduleForm.get("daysOfWeek")?.setErrors({ required: true });
      }
    }

    this.checkTourScheduleByStartDateAndEndDate();
  }

  isDaySelected(day: string): boolean {
    return this.daysOfWeek.controls.some(
      (control: AbstractControl) => control.value === day
    );
  }

  typeOfPersonIsSelected(
    typeOfPerson: TypeOfPersonLabel,
    indexSlot: number,
    indexPrice: number
  ): boolean {
    const typesOfPeople = this.prices(indexSlot)
      .controls.map((control, index) => {
        if (index !== indexPrice) {
          return (control as FormGroup).get("ageType")?.value;
        }
      })
      .filter((v) => v);

    return typesOfPeople.includes(typeOfPerson);
  }

  // Check if ANY option should be available for a specific price
  isAnyOptionAvailable(indexSlot: number, indexPrice: number): boolean {
    if (this.isGroupTour) {
      return true;
    }
    // ANY is only available for the first price (index 0) AND only if there's only one price
    const pricesCount = this.prices(indexSlot).length;
    return indexPrice === 0 && pricesCount === 1;
  }

  checkTourScheduleByStartDateAndEndDate() {
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;
    const daysOfWeek: string[] = this.tourScheduleForm.get("daysOfWeek")?.value || [];
    console.log('[Calendar] checkTourSchedule — start:', startDate, 'end:', endDate, 'days:', daysOfWeek);

    if (!startDate || !endDate) {
      this.tourScheduleId = 0;
      return;
    }

    const startDateDayJs = dayjs(startDate);
    const endDateDayJs = dayjs(endDate);
    const daysDifference = endDateDayJs.diff(startDateDayJs, "day");
    const filterByDays = daysOfWeek.length > 0;

    let allDaysHaveSlots = true;
    let firstFoundConfigId = 0;
    let countTargetDates = 0;

    for (let i = 0; i <= daysDifference; i++) {
      const currentDate = startDateDayJs.add(i, "day");
      const dayOfWeekVal = this.DAYS_OF_WEEK[currentDate.day()].value;

      // Si hay días de semana configurados, filtrar solo esos; si no, revisar todos
      if (!filterByDays || daysOfWeek.includes(dayOfWeekVal)) {
        countTargetDates++;
        const dateStr = currentDate.format("YYYY-MM-DD");
        const found = this.tourSchedules.find(s => s.scheduleDate === dateStr);

        if (!found) {
          allDaysHaveSlots = false;
          break;
        } else if (found.configId && firstFoundConfigId === 0) {
          firstFoundConfigId = found.configId;
        }
      }
    }

    if (countTargetDates > 0 && allDaysHaveSlots && firstFoundConfigId > 0) {
      this.tourScheduleId = firstFoundConfigId;
    } else {
      this.tourScheduleId = 0;
    }
  }

  get allDaysHaveSlots(): boolean {
    return this.tourScheduleId > 0;
  }

  loadConfig(configId: number) {
    console.log('[Calendar] loadConfig — configId:', configId);
    // Buscar un schedule que tenga este configId
    const found = this.tourSchedules.find((schedule) => schedule.configId === configId);

    if (found && found.config) {
      // Preservar las fechas seleccionadas por el usuario en el calendario
      const currentStartDate = this.tourScheduleForm.get("startDate")?.value;
      const currentEndDate = this.tourScheduleForm.get("endDate")?.value;

      this.tourScheduleId = found.config.id;
      this.tourSchedule = {
        id: found.config.id,
        tourId: found.tourId,
        label: found.config.label,
        startDate: found.scheduleDate,
        endDate: found.scheduleDate,
        daysOfWeek: found.config.daysOfWeek,

        slots: found.config.slots
      };

      this.tourScheduleForm.patchValue({
        label: found.config.label,

      }, { emitEvent: false });

      // Limpiar y rellenar días de semana sin duplicados
      this.daysOfWeek.clear();
      const uniqueDays = [...new Set(found.config.daysOfWeek)];
      uniqueDays.forEach((dayOfWeek) => {
        this.daysOfWeek.push(new FormControl(dayOfWeek));
      });

      // Limpiar slots existentes y cargar nuevos
      this.slots.clear();
      
      found.config.slots?.forEach((slot, slotIndex) => {
        const newSlot = this.fb.group({
          id: [slot.id || ""],
          startTime: [slot.startTime || ""],
          endTime: [slot.endTime || ""],
          capacity: [slot.capacity !== null && slot.capacity !== undefined ? slot.capacity : (slot as any).maxCapacity || 0],
          prices: this.fb.array([]),
        });

        this.slots.push(newSlot);

        slot.prices?.forEach((price, priceIndex) => {
          const ageTypeValue = typeof price.ageType === 'object' 
            ? price.ageType.name 
            : price.ageType;

          const newPrice = this.fb.group({
            id: [price.id || ""],
            ageType: [ageTypeValue || ""],
            providerPrice: [price.providerPrice || ""],
          });

          this.prices(slotIndex).push(newPrice);
        });
      });

      // Restaurar fechas seleccionadas por el usuario (sin disparar eventos que reseteen el form)
      this.tourScheduleForm.get("startDate")?.setValue(currentStartDate, { emitEvent: false });
      this.tourScheduleForm.get("endDate")?.setValue(currentEndDate, { emitEvent: false });
      if (currentStartDate instanceof Date && currentEndDate instanceof Date) {
        this.bsRangeValue = [currentStartDate, currentEndDate];
      }
    }
  }

  // ─── Inline datepicker handlers ─────────────────────────────────────────────

  /**
   * Called every time bs-datepicker-inline emits a value.
   * First click  → start = end = selected day (single-day selection)
   * Second click → if same day, deselect; if different day, form a range
   */
  /**
   * @HostListener on document:click catches picker clicks regardless of
   * where ngx-bootstrap inserts the bs-daterangepicker-inline container in the DOM.
   * bsValueChange only fires on the SECOND click; this fires on the FIRST too.
   */
  onCalendarClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Only process clicks inside a bs-datepicker-body
    if (!target.closest('.bs-datepicker-body')) return;

    // Get the span that was clicked (or find the span inside the clicked element)
    const span = (target.tagName === 'SPAN' ? target : target.querySelector('span') ?? target.closest('span')) as HTMLElement | null;
    if (!span) return;

    const td = span.closest('td') as HTMLElement | null;
    if (!td) return;

    // Skip disabled or "other month" cells
    if (
      td.classList.contains('disabled') ||
      td.classList.contains('is-other-month') ||
      span.classList.contains('disabled')
    ) return;

    const dayNum = parseInt(span.textContent?.trim() ?? '0', 10);
    if (!dayNum || isNaN(dayNum)) return;

    // Parse month and year from the picker header
    const container = target.closest('.bs-datepicker-container') as HTMLElement | null;
    if (!container) return;

    const headerButtons = container.querySelectorAll<HTMLElement>('.bs-datepicker-head button.current');
    if (headerButtons.length < 2) return;

    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const monthStr = headerButtons[0]?.textContent?.trim() ?? '';
    const yearStr  = headerButtons[1]?.textContent?.trim() ?? '';
    const month = MONTHS.indexOf(monthStr);
    const year  = parseInt(yearStr, 10);

    if (month === -1 || isNaN(year)) return;

    const clickedDate = dayjs().year(year).month(month).date(dayNum)
                               .hour(0).minute(0).second(0).millisecond(0).toDate();

    console.log('[Calendar] onCalendarClick — clicked date:', dayjs(clickedDate).format('YYYY-MM-DD'));

    // Don't double-process if bsValueChange re-entry guard is active
    if (this._handlingInlineChange) return;

    // Update viewDate and show info box immediately (works on FIRST click)
    this.viewDate = clickedDate;
    const dateStr = dayjs(clickedDate).format('YYYY-MM-DD');

    const dayEvents = this.events.filter(ev => {
      const evStart = dayjs(ev.start).format('YYYY-MM-DD');
      const evEnd   = dayjs(ev.end).format('YYYY-MM-DD');
      return dateStr >= evStart && dateStr <= evEnd;
    });
    this.eventsOnSelectedDay = dayEvents;
    this.activeDayIsOpen = dayEvents.length > 0;

    // Update form tentatively (single-day; bsValueChange will confirm range on 2nd click)
    this.tourScheduleForm.get('startDate')?.setValue(clickedDate, { emitEvent: false });
    this.tourScheduleForm.get('endDate')?.setValue(clickedDate,   { emitEvent: false });

    const existingSchedule = this.tourSchedules.find(s => s.scheduleDate === dateStr);
    if (existingSchedule?.configId) {
      this.loadConfig(existingSchedule.configId);
    } else {
      this.resetFormExceptDates(true);
    }
  }

  private _lastInlineStart: number | null = null;
  private _lastInlineEnd:   number | null = null;
  private _handlingInlineChange = false; // re-entry guard

  onInlineDateChange(dates: (Date | undefined)[] | undefined): void {
    console.log('[Calendar] onInlineDateChange — raw dates:', dates);

    // Re-entry guard: prevents the loop caused by updating [bsValue] which re-fires bsValueChange
    if (this._handlingInlineChange) {
      console.log('[Calendar] onInlineDateChange — SKIP (re-entry guard)');
      return;
    }

    if (!dates || dates.length === 0) return;

    const start = dates[0];
    const end   = dates[1];

    const startMs = start instanceof Date ? start.getTime() : null;
    const endMs   = end   instanceof Date ? end.getTime()   : null;

    // Skip if incomplete (end not yet chosen = user still hovering)
    if (startMs === null || endMs === null) {
      console.log('[Calendar] onInlineDateChange — SKIP (hovering, end not set yet)');
      return;
    }

    // Skip if nothing actually changed (prevents double-fire)
    if (startMs === this._lastInlineStart && endMs === this._lastInlineEnd) {
      console.log('[Calendar] onInlineDateChange — SKIP (same range, no change)');
      return;
    }

    console.log('[Calendar] onInlineDateChange — SELECTION COMPLETE — start:', start, 'end:', end);

    this._handlingInlineChange = true;
    try {
      this._lastInlineStart = startMs;
      this._lastInlineEnd   = endMs;

      const startDateControl = this.tourScheduleForm.get('startDate');
      const endDateControl   = this.tourScheduleForm.get('endDate');

      // emitEvent:false prevents ngOnInit valueChanges subscriptions from firing
      // (which would call checkTourScheduleByStartDateAndEndDate again)
      startDateControl?.setValue(start, { emitEvent: false });
      endDateControl?.setValue(end,     { emitEvent: false });
      
      this.bsRangeValue = [start as Date, end as Date];

      // Sync tour schedule detection (single call)
      this.checkTourScheduleByStartDateAndEndDate();

      // Load config and show info box if single-day selection
      if (isSameDay(start!, end!)) {
        // Update viewDate so the template renders the correct date header
        this.viewDate = start!;

        // Find all events that cover this day
        const dateStr = dayjs(start).format('YYYY-MM-DD');
        const dayEvents = this.events.filter(ev => {
          const evStart = dayjs(ev.start).format('YYYY-MM-DD');
          const evEnd   = dayjs(ev.end).format('YYYY-MM-DD');
          return dateStr >= evStart && dateStr <= evEnd;
        });
        this.eventsOnSelectedDay = dayEvents;
        this.activeDayIsOpen = dayEvents.length > 0;

        const existingSchedule = this.tourSchedules.find(s => s.scheduleDate === dateStr);
        if (existingSchedule?.configId) {
          this.loadConfig(existingSchedule.configId);
        } else {
          this.resetFormExceptDates(true);
        }
      } else {
        // Range selection: hide info box
        this.activeDayIsOpen = false;
        this.eventsOnSelectedDay = [];
        this.resetFormExceptDates(false);
      }
    } finally {
      this._handlingInlineChange = false;
    }
  }

  resetInlineDate(): void {
    console.log('[Calendar] resetInlineDate — clearing all dates');
    this._lastInlineStart = null;
    this._lastInlineEnd   = null;
    this.inlineDateValue  = [];
    this.bsRangeValue = undefined;
    this.tourScheduleForm.get('startDate')?.setValue(null, { emitEvent: false });
    this.tourScheduleForm.get('endDate')?.setValue(null,   { emitEvent: false });
    this.resetForm();
  }

  // ─────────────────────────────────────────────────────────────────────────────

  resetForm() {
    this.tourScheduleForm.reset();
    this.daysOfWeek.clear();
    this.slots.clear();
    this.addSlot();
    this.tourScheduleId = 0;
    this.tourSchedule = null;
    this.submitted = false;
    this.errorMessage = "";
    this.bsRangeValue = undefined;
  }

  resetFormExceptDates(isSingleDay: boolean = false) {
    console.log('[Calendar] resetFormExceptDates — isSingleDay:', isSingleDay);
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;

    this.tourScheduleForm.patchValue({
      label: ""
    }, { emitEvent: false });

    this.daysOfWeek.clear();
    if (isSingleDay && startDate) {
      const dayName = this.DAYS_OF_WEEK[dayjs(startDate).day()].value;
      this.daysOfWeek.push(new FormControl(dayName));
    }

    this.slots.clear();
    this.addSlot();
    this.tourScheduleId = 0;
    this.tourSchedule = null;
    this.submitted = false;
    this.errorMessage = "";

    // Restaurar fechas
    this.tourScheduleForm.get("startDate")?.setValue(startDate, { emitEvent: false });
    this.tourScheduleForm.get("endDate")?.setValue(endDate, { emitEvent: false });
    if (startDate instanceof Date && endDate instanceof Date) {
      this.bsRangeValue = [startDate, endDate];
    } else {
      this.bsRangeValue = undefined;
    }
  }

  saveTourSchedule() {
    const {
      label,
      startDate,
      endDate,
      daysOfWeek,

      slots,
    } = this.tourScheduleForm.value;

    // Convert ANY to ADULT before sending to backend
    const processedSlots = slots.map((slot: any) => ({
      ...slot,
      prices: slot.prices.map((price: any) => ({
        ...price,
        ageType: price.ageType === TypeOfPersonLabel.ANY ? TypeOfPersonLabel.ADULT : price.ageType,
        providerPrice: price.providerPrice
      }))
    }));

    const body = {
      tourId: this.tourId,
      label,
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      daysOfWeek,

      slots: processedSlots,
      createdBy: 1,
    };

    this.tourService.saveTourSchedule(body).subscribe({
      next: (data) => {
        this.loading = false;
        if (data) {
          this.openSnackBar("Tour schedule saved successfully.");
          this.getSchedules();
          this.resetForm();
        } else {
          this.errorMessage =
            "Ha ocurrido un error, por favor intente de nuevo";
        }
      },
      error: (err) => {
        this.loading = false;
        console.error("Error saving tour schedule.");
        console.error(err);

        this.errorMessage = "Ha ocurrido un error, por favor intente de nuevo";
      },
    });
  }

  updateTourSchedule() {
    // Siempre usar el método batch para actualizaciones (usar el mismo método que crear)
    this.updateTourScheduleBatch();
  }

  getTour() {
    this.tourService.getTourById(this.tourId).subscribe({
      next: (data: Tour) => {
        if (data) {
          this.tour = data;

          if (this.isGroupTour) {
            // If it's a group tour, ensure that all slots have only one price set to ANY
            this.slots.controls.forEach((slot, index) => {
              const pricesArray = this.prices(index);
              if (pricesArray.length > 0) {
                pricesArray.at(0).get('ageType')?.setValue(TypeOfPersonLabel.ANY);
                // Remove other prices if any
                while (pricesArray.length > 1) {
                  pricesArray.removeAt(1);
                }
              }
            });
          }
        } else {
          this.tour = {};
          this.openSnackBar("Error getting tour.");
        }
      },
      error: (err: any) => {
        console.error("Error getting tour.");
        console.error(err);
        this.tour = {};
        this.openSnackBar("Error getting tour.");
      },
    });
  }

  getSchedules() {
    console.log('[Calendar] getSchedules — tourId:', this.tourId);
    this.tourService.getSchedulesByTourId(this.tourId).subscribe({
      next: (data: TourScheduleConfigResponseDto[]) => {
        if (data) {
          this.tourSchedules = data;
          
          // Agrupar por configId para crear eventos únicos por configuración
          const groupedSchedules = this.groupSchedulesByConfig(data);
          
          const events: any[] = Object.values(groupedSchedules).map((group: any) => {
            const firstSchedule = group[0];
            const config = firstSchedule.config;
            
            // Crear evento para el rango de fechas de esta configuración
            const startDateDayJs = dayjs(firstSchedule.scheduleDate);
            const endDateDayJs = dayjs(group[group.length - 1].scheduleDate);
            
            const color = {
              primary: this.getRandomHexColor(),
              secondary: this.getRandomHexColor(),
            };

            return {
              start: new Date(startDateDayJs.toISOString()),
              end: new Date(endDateDayJs.toISOString()),
              title: config.label,
              draggable: false,
              color: color,
              allDay: true,
              meta: {
                configId: config.id,
                tourId: this.tourId,
                label: config.label,
                daysOfWeek: config.daysOfWeek,

                slots: config.slots,
                schedules: group // Incluir todos los días de esta configuración
              },
            };
          });

          this.events = events;
          this.refresh.next();
        } else {
          this.tourSchedules = [];
          this.openSnackBar("Error getting tour schedules.");
        }
      },
      error: (err: any) => {
        console.error("Error getting tour schedules.");
        console.error(err);
        this.tourSchedules = [];
        this.openSnackBar("Error getting tour schedules.");
      },
    });
  }

  // Método auxiliar para agrupar schedules por configId
  private groupSchedulesByConfig(schedules: TourScheduleConfigResponseDto[]): { [key: number]: TourScheduleConfigResponseDto[] } {
    return schedules.reduce((groups, schedule) => {
      const configId = schedule.configId;
      if (!groups[configId]) {
        groups[configId] = [];
      }
      groups[configId].push(schedule);
      return groups;
    }, {} as { [key: number]: TourScheduleConfigResponseDto[] });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 5000,
    });
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent("Dropped or resized", event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    const today = dayjs().hour(0).minute(0).second(0).millisecond(0);
    const dateDayJs = dayjs(date);

    const startDateControl = this.tourScheduleForm.get("startDate");
    const endDateControl = this.tourScheduleForm.get("endDate");

    const startDateValue = startDateControl?.value;
    const endDateValue = endDateControl?.value;

    const startDateDayJs = dayjs(startDateValue);
    const endDateDayJs = dayjs(endDateValue);

    if (dateDayJs.isValid() && !dateDayJs.isBefore(today)) {
      const hasStart = !!startDateValue;
      const hasEnd = !!endDateValue;
      const isSingleDayActive = hasStart && hasEnd && isSameDay(startDateValue, endDateValue);
      const isRangeActive = hasStart && hasEnd && !isSameDay(startDateValue, endDateValue);

      if (!hasStart) {
        // Caso 1: Sin selección → asignar inicio y fin al mismo día
        startDateControl?.setValue(date);
        endDateControl?.setValue(date);
      } else if (isSingleDayActive && startDateDayJs.isSame(dateDayJs, 'day')) {
        // Caso 2: Un día seleccionado, clic en el mismo → deseleccionar
        startDateControl?.setValue(null);
        endDateControl?.setValue(null);
      } else if (isSingleDayActive && !startDateDayJs.isSame(dateDayJs, 'day')) {
        // Caso 3: Un día seleccionado, clic en otro → crear rango respetando orden
        if (dateDayJs.isBefore(startDateDayJs)) {
          startDateControl?.setValue(date);
          // endDate queda como estaba (= el día previamente seleccionado)
        } else {
          // endDate = nuevo día, startDate queda como estaba
          endDateControl?.setValue(date);
        }
      } else if (isRangeActive) {
        // Caso 4: Rango activo
        const clickedStart = startDateDayJs.isSame(dateDayJs, 'day');
        const clickedEnd = endDateDayJs.isSame(dateDayJs, 'day');

        if (clickedEnd) {
          // Clic en la fecha fin → colapsar al día inicio (inicio = fin = startDate)
          endDateControl?.setValue(startDateValue);
        } else if (clickedStart) {
          // Clic en la fecha inicio → colapsar al día fin (inicio = fin = endDate)
          startDateControl?.setValue(endDateValue);
        } else if (dateDayJs.isBefore(startDateDayJs)) {
          // Clic antes del inicio → mover inicio
          startDateControl?.setValue(date);
        } else {
          // Clic después del fin → mover fin
          endDateControl?.setValue(date);
        }
      }
    }

    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;
    const isSingleDaySelection = startDate && (!endDate || isSameDay(startDate, endDate));
    const isMultiDaySelection = startDate && endDate && !isSameDay(startDate, endDate);

    if (isSameMonth(date, this.viewDate)) {
      if (isMultiDaySelection) {
        this.activeDayIsOpen = false;
        this.eventsOnSelectedDay = [];
        this.resetFormExceptDates(false);
      } else if (isSingleDaySelection) {
        this.activeDayIsOpen = true;
        this.eventsOnSelectedDay = events;

        const dateStr = dayjs(date).format("YYYY-MM-DD");
        const existingSchedule = this.tourSchedules.find(s => s.scheduleDate === dateStr);
        
        if (existingSchedule && existingSchedule.configId) {
          this.loadConfig(existingSchedule.configId);
        } else {
          this.resetFormExceptDates(true);
        }
      } else {
        // No hay selección o se deseleccionó
        if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) {
          this.activeDayIsOpen = false;
          this.eventsOnSelectedDay = [];
          this.resetForm();
        } else if (events.length > 0) {
          this.activeDayIsOpen = true;
          this.eventsOnSelectedDay = events;
        } else {
          this.resetForm();
        }
      }
      this.viewDate = date;
      this.refresh.next();
      this.checkTourScheduleByStartDateAndEndDate();
    }
  }

  monthIsAfterToday() {
    const todayMonth = dayjs()
      .date(1)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    const monthView = dayjs(this.viewDate)
      .date(1)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    return monthView.isAfter(todayMonth);
  }

  monthIsTodayMonth() {
    const todayMonth = dayjs()
      .date(1)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    const monthView = dayjs(this.viewDate)
      .date(1)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    return monthView.isSame(todayMonth, "month");
  }

  isDateInSelectedRange(date: Date): boolean {
    const startDateControl = this.tourScheduleForm.get("startDate");
    const endDateControl = this.tourScheduleForm.get("endDate");

    const startDateValue = startDateControl?.value;
    const endDateValue = endDateControl?.value;

    if (startDateValue && endDateValue) {
      return (
        date >= startOfDay(startDateValue) && date <= endOfDay(endDateValue)
      );
    } else if (startDateValue && !endDateValue) {
      return isSameDay(date, startDateValue);
    }
    return false;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;

    if (this.allMonthSelected) {
      this.toggleAllMonth();
    }
  }

  getRandomHexColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return "#" + randomColor.padStart(6, "0");
  }

  checkAllMonthSelected() {
    const minDateStartDate = dayjs(this.minDateStartDate)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    const startDateControl = this.tourScheduleForm.get("startDate");
    const startDate = startDateControl?.value;
    const startDateDayJs = dayjs(startDate);

    const endDateControl = this.tourScheduleForm.get("endDate");
    const endDate = endDateControl?.value;
    const endDateDayJs = dayjs(endDate);

    if (
      endDateDayJs.isSame(startDateDayJs, "month") &&
      endDateDayJs.date() === endDateDayJs.daysInMonth() &&
      (startDateDayJs.isSame(minDateStartDate, "day") ||
        startDateDayJs.day() === 1)
    ) {
      this.allMonthSelected = true;
    } else {
      this.allMonthSelected = false;
    }
  }

  toggleAllMonth() {
    this.allMonthSelected = !this.allMonthSelected;

    const today = dayjs().hour(0).minute(0).second(0).millisecond(0);
    const viewDateDayJs = dayjs(this.viewDate);

    const startDateControl = this.tourScheduleForm.get("startDate");
    const endDateControl = this.tourScheduleForm.get("endDate");

    if (this.allMonthSelected) {
      if (viewDateDayJs.isSame(today, "month")) {
        startDateControl?.setValue(today.toDate());
        endDateControl?.setValue(viewDateDayJs.endOf("month").toDate());
      } else {
        startDateControl?.setValue(viewDateDayJs.startOf("month").toDate());
        endDateControl?.setValue(viewDateDayJs.endOf("month").toDate());
      }
    } else {
      startDateControl?.setValue("");
      endDateControl?.setValue("");
    }
    
    // Hide the open day events view if a month is selected
    if (this.allMonthSelected) {
      this.activeDayIsOpen = false;
    }
  }

  openSnackBarWithAction(
    message: string,
    action: string,
    tourScheduleId: number
  ) {
    const snackBarRef = this._snackBar.open(message, action, {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      // Perform your action here (e.g., undo the archived message)
      this.loadConfig(tourScheduleId);
    });
  }

  // Métodos para manejo de templates
  loadTemplates(): void {
    this.templatesLoading = true;
    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.templatesLoading = false;
      },
      error: (error) => {
        console.error("Error loading templates:", error);
        this.templatesLoading = false;
        this.openSnackBar("Error al cargar los templates");
      }
    });
  }

  onTemplateSelectionChange(event: any): void {
    this.selectedTemplateId = event.value;
    this.selectedTemplate = this.templates.find(t => t.id === event.value) || null;
  }

  applyTemplate(): void {
    if (!this.selectedTemplate) {
      this.openSnackBar("Por favor selecciona un template");
      return;
    }

    // Limpiar el formulario actual
    this.resetForm();

    // Aplicar los datos del template al formulario
    this.tourScheduleForm.patchValue({
      label: this.selectedTemplate.label,

    });

    // Aplicar días de la semana
    this.daysOfWeek.clear();
    this.selectedTemplate.daysOfWeek.forEach((dayOfWeek) => {
      this.daysOfWeek.push(new FormControl(dayOfWeek));
    });

    // Aplicar slots
    this.slots.clear();
    if (this.selectedTemplate.slots && this.selectedTemplate.slots.length > 0) {
      this.selectedTemplate.slots.forEach((slot, slotIndex) => {
        // Crear nuevo slot
        const newSlot = this.fb.group({
          id: [slot.id || ""],
          startTime: [slot.startTime || ""],
          endTime: [slot.endTime || ""],
          capacity: [slot.capacity !== null && slot.capacity !== undefined ? slot.capacity : (slot as any).maxCapacity || 0],
          prices: this.fb.array([]),
        });

        // Agregar el slot al FormArray
        this.slots.push(newSlot);

        // Procesar precios del slot
        slot.prices?.forEach((price, priceIndex) => {
          // Manejar ageType que puede venir como objeto o string
          const ageTypeValue = typeof price.ageType === 'object' 
            ? price.ageType.name 
            : price.ageType;

          // Crear nuevo precio
          const newPrice = this.fb.group({
            id: [price.id || ""],
            ageType: [ageTypeValue || ""],
            providerPrice: [price.providerPrice || ""],
          });

          // Agregar el precio al FormArray de precios del slot
          this.prices(slotIndex).push(newPrice);
        });
      });
    } else {
      // Si no hay slots en el template, agregar uno por defecto
      this.addSlot();
    }

    this.openSnackBar("Template aplicado correctamente");
  }

  // Método para guardar configuraciones por fecha usando batch
  saveTourScheduleBatch(): void {
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;
    const daysOfWeek = this.tourScheduleForm.get("daysOfWeek")?.value;
    const slots = this.tourScheduleForm.get("slots")?.value;

    if (!startDate || !endDate || !daysOfWeek || daysOfWeek.length === 0) {
      this.openSnackBar("Por favor completa todos los campos requeridos");
      return;
    }

    this.loading = true;

    // Generar fechas basadas en los días de la semana seleccionados
    const startDateDayJs = dayjs(startDate);
    const endDateDayJs = dayjs(endDate);
    const daysDifference = endDateDayJs.diff(startDateDayJs, "day");
    
    const batchData: any[] = [];

    for (let i = 0; i <= daysDifference; i++) {
      const currentDate = startDateDayJs.add(i, "day");
      const dayOfWeek = this.DAYS_OF_WEEK[currentDate.day()].value;

      // Verificar si este día está en los días seleccionados
      if (daysOfWeek.includes(dayOfWeek)) {
        const scheduleDate = currentDate.format("YYYY-MM-DD");

        // Crear entrada para cada slot
        slots.forEach((slot: any) => {
          const batchEntry = {
            tourId: this.tourId,
            scheduleDate: scheduleDate,
            reservedCapacity: 0,

            status: "available",
            config: {
              tourId: this.tourId,
              providerId: this.authService.getIdProvider(),
              label: this.tourScheduleForm.get("label")?.value,
              startDate: startDateDayJs.format("YYYY-MM-DD"),
              endDate: endDateDayJs.format("YYYY-MM-DD"),
              daysOfWeek: daysOfWeek,

              isTemplate: false,
              slots: slots.map((s: any) => ({
                startTime: s.startTime,
                endTime: s.endTime,
                capacity: s.capacity,
                prices: s.prices.map((p: any) => ({
                  ageType: p.ageType === TypeOfPersonLabel.ANY ? TypeOfPersonLabel.ADULT : p.ageType,
                  providerPrice: p.providerPrice,
                })),
              }))
            }
          };

          batchData.push(batchEntry);
        });
      }
    }

    this.tourService.saveTourScheduleBatch(batchData).subscribe({
      next: (data) => {
        this.loading = false;
        this.openSnackBar("Configuraciones guardadas correctamente");
        this.getSchedules();
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        console.error("Error saving batch tour schedules:", error);
        this.openSnackBar("Error al guardar las configuraciones");
      }
    });
  }

  // Método para actualizar configuraciones por fecha usando batch
  updateTourScheduleBatch(): void {
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;
    const daysOfWeek = this.tourScheduleForm.get("daysOfWeek")?.value;
    const slots = this.tourScheduleForm.get("slots")?.value;

    if (!startDate || !endDate || !daysOfWeek || daysOfWeek.length === 0) {
      this.openSnackBar("Por favor completa todos los campos requeridos");
      return;
    }

    this.loading = true;

    // Generar fechas basadas en los días de la semana seleccionados
    const startDateDayJs = dayjs(startDate);
    const endDateDayJs = dayjs(endDate);
    const daysDifference = endDateDayJs.diff(startDateDayJs, "day");
    
    const batchData: any[] = [];

    for (let i = 0; i <= daysDifference; i++) {
      const currentDate = startDateDayJs.add(i, "day");
      const dayOfWeek = this.DAYS_OF_WEEK[currentDate.day()].value;

      // Verificar si este día está en los días seleccionados
      if (daysOfWeek.includes(dayOfWeek)) {
        const scheduleDate = currentDate.format("YYYY-MM-DD");

        // Crear una entrada por fecha (no por slot)
        const batchEntry = {
          tourId: this.tourId,
          scheduleDate: scheduleDate,
          reservedCapacity: 0,

          status: "AVAILABLE",
          config: {
            id: this.tourScheduleId, // Incluir el ID de la configuración existente
            label: this.tourScheduleForm.get("label")?.value,
            daysOfWeek: daysOfWeek,

            slots: slots.map((s: any) => ({
              id: s.id || 0, // Incluir ID del slot si existe
              startTime: s.startTime,
              endTime: s.endTime,
              capacity: s.capacity,
              prices: s.prices.map((p: any) => ({
                id: p.id || 0, // Incluir ID del precio si existe
                ageType: p.ageType === TypeOfPersonLabel.ANY ? TypeOfPersonLabel.ADULT : p.ageType,
                providerPrice: p.providerPrice
              }))
            }))
          }
        };

        batchData.push(batchEntry);
      }
    }

    this.tourService.saveTourScheduleBatch(batchData).subscribe({
      next: (data) => {
        this.loading = false;
        this.openSnackBar("Configuraciones actualizadas correctamente");
        this.getSchedules();
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        console.error("Error updating batch tour schedules:", error);
        this.openSnackBar("Error al actualizar las configuraciones");
      }
    });
  }

  // Métodos auxiliares para el template
  getDayAbbreviation(day: string): string {
    const dayAbbreviations: { [key: string]: string } = {
      'SUNDAY': 'DOM',
      'MONDAY': 'LUN',
      'TUESDAY': 'MAR',
      'WEDNESDAY': 'MIÉ',
      'THURSDAY': 'JUE',
      'FRIDAY': 'VIE',
      'SATURDAY': 'SÁB'
    };
    return dayAbbreviations[day] || day;
  }

  getAgeTypeDisplay(ageType: any): string {
    if (typeof ageType === 'object' && ageType.name) {
      return ageType.name;
    }
    return ageType || '';
  }

  getSlotsByDate(event: any, date: Date): any[] {
    if (event.meta && event.meta.schedules) {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const foundSchedule = event.meta.schedules.find((s: any) => s.scheduleDate === dateStr);
      if (foundSchedule && foundSchedule.config && foundSchedule.config.slots) {
        return foundSchedule.config.slots;
      }
    }
    return [];
  }

  getDayMetrics(event: any, date: Date): { capacity: number, availability: number, bookings: number } | null {
    if (event.meta && event.meta.schedules) {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const foundSchedule = event.meta.schedules.find((s: any) => s.scheduleDate === dateStr);
      if (foundSchedule) {
        const slots = foundSchedule.config?.slots || [];
        const metrics = slots.reduce((acc: any, s: any) => ({
          capacity: acc.capacity + (Number(s.capacity) || 0),
          availability: acc.availability + (Number(s.availability) || 0),
          bookings: acc.bookings + (Number(s.bookings) || 0)
        }), { capacity: 0, availability: 0, bookings: 0 });
        return metrics;
      }
    }
    return null;
  }

  @HostListener("document:mousedown", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.calendarContainer) return;

    const clickedInside = this.calendarContainer.nativeElement.contains(event.target);
    const formElement = document.getElementById("template_selection");
    const formElement2 = document.querySelector(".col-lg-4");
    const clickedInForm = formElement?.contains(event.target as Node) || formElement2?.contains(event.target as Node);
    const clickedInOverlay = document.querySelector('.cdk-overlay-container')?.contains(event.target as Node);

    if (!clickedInside && !clickedInForm && !clickedInOverlay) {
      const startDateControl = this.tourScheduleForm.get("startDate");
      const endDateControl = this.tourScheduleForm.get("endDate");
      
      if (startDateControl?.value || endDateControl?.value) {
        startDateControl?.setValue(null);
        endDateControl?.setValue(null);
        this.activeDayIsOpen = false;
        this.refresh.next();
      }
    }
  }

  isPast(date: Date): boolean {
    const today = dayjs().hour(0).minute(0).second(0).millisecond(0);
    return dayjs(date).isBefore(today);
  }
}
