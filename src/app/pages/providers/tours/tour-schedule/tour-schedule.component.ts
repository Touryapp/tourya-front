import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
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
import { isSameDay, isSameMonth } from "date-fns";
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
import { TranslateService } from "@ngx-translate/core";
@Component({
  selector: "app-tour-schedule",
  standalone: false,
  templateUrl: "./tour-schedule.component.html",
  styleUrl: "./tour-schedule.component.scss",
})
export class TourScheduleComponent {
  @ViewChild("calendarContainer") calendarContainer!: ElementRef;
  public routes = routes;
  loading = false;
  tourScheduleForm: FormGroup;
  isBackoffice: boolean = false;
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
  bsRangeValue: Date[] | undefined = undefined;

  // Fecha seleccionada en el calendario grande (independiente del formulario)
  calendarSelectedDate: Date | null = null;
  minDateStartDate: Date = dayjs()
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate();
  minDateEndDate: Date | undefined = undefined;
  maxDateEndDate: Date | undefined = undefined;

  DAYS_OF_WEEK = [
    { label: "tour-schedule.config.daysOfWeek.SUNDAY", value: "SUNDAY", day: 0 },
    { label: "tour-schedule.config.daysOfWeek.MONDAY", value: "MONDAY", day: 1 },
    { label: "tour-schedule.config.daysOfWeek.TUESDAY", value: "TUESDAY", day: 2 },
    { label: "tour-schedule.config.daysOfWeek.WEDNESDAY", value: "WEDNESDAY", day: 3 },
    { label: "tour-schedule.config.daysOfWeek.THURSDAY", value: "THURSDAY", day: 4 },
    { label: "tour-schedule.config.daysOfWeek.FRIDAY", value: "FRIDAY", day: 5 },
    { label: "tour-schedule.config.daysOfWeek.SATURDAY", value: "SATURDAY", day: 6 },
  ];

  view: CalendarView = CalendarView.Month;
  viewDate: Date = dayjs().hour(0).minute(0).second(0).millisecond(0).toDate();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  refresh = new Subject<void>();
  eventsOnSelectedDay: CalendarEvent[] = [];

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
    private translate: TranslateService
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
      touryaPercentage: ["", [Validators.min(0), Validators.max(100)]],
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
    return this.tour?.priceType === 'grupo';
  }

  get isUnlimitedCapacity(): boolean {
    return this.tour?.isUnlimitedCapacity === true;
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
    this.isBackoffice = this.authService.isAdmin();
    // Los campos de fecha del formulario (Start Date / End Date) ya NO sincronizan
    // con el calendario grande. Cada lógica es independiente.
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

        // Sync bsRangeValue solo para el picker del formulario (NO afecta el calendario grande)
        if (startDate && endDate) {
          const newStart = startDateDayJs.toDate();
          const newEnd = dayjs(endDate).toDate();
          if (!this.bsRangeValue || !this.bsRangeValue[0] || !this.bsRangeValue[1] || 
              this.bsRangeValue[0].getTime() !== newStart.getTime() || 
              this.bsRangeValue[1].getTime() !== newEnd.getTime()) {
            this.bsRangeValue = [newStart, newEnd];
          }
        } else if (startDate) {
          const newStart = startDateDayJs.toDate();
          if (!this.bsRangeValue || !this.bsRangeValue[0] || this.bsRangeValue[0].getTime() !== newStart.getTime()) {
            this.bsRangeValue = [newStart, newStart];
          }
        } else {
          this.bsRangeValue = undefined;
        }

        this.checkAllMonthSelected();
        this.checkTourScheduleByStartDateAndEndDate();
      });

    this.tourScheduleForm.get("endDate")?.valueChanges.subscribe((endDate) => {
      const startDate = this.tourScheduleForm.get("startDate")?.value;
      if (startDate && endDate) {
        const newStart = dayjs(startDate).toDate();
        const newEnd = dayjs(endDate).toDate();
        if (!this.bsRangeValue || !this.bsRangeValue[0] || !this.bsRangeValue[1] || 
            this.bsRangeValue[0].getTime() !== newStart.getTime() || 
            this.bsRangeValue[1].getTime() !== newEnd.getTime()) {
          this.bsRangeValue = [newStart, newEnd];
        }
      }
      this.checkAllMonthSelected();
      this.checkTourScheduleByStartDateAndEndDate();
    });

    this.slots.valueChanges.subscribe((value) => {
      // Age and capacity validation removed
    });
  }

  ngOnDestroy(): void {}





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
    }
  }

  onFormDateRangeChange(dates: (Date | undefined)[] | undefined | null) {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      this.tourScheduleForm.get("startDate")?.setValue(dates[0]);
      this.tourScheduleForm.get("endDate")?.setValue(dates[1]);
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

  onAgeTypeChange(indexSlot: number, indexPrice: number) {
    const priceGroup = this.prices(indexSlot).at(indexPrice) as FormGroup;
    if (priceGroup.get('ageType')?.value === TypeOfPersonLabel.INFANT) {
      priceGroup.get('providerPrice')?.setValue(0);
    }
  }
  checkTourScheduleByStartDateAndEndDate() {
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;
    const daysOfWeek: string[] = this.tourScheduleForm.get("daysOfWeek")?.value || [];

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
      
      const sortedSlots = found.config.slots ? [...found.config.slots].sort((a: any, b: any) => {
        const timeA = a.startTime || "";
        const timeB = b.startTime || "";
        return timeA.localeCompare(timeB);
      }) : [];

      sortedSlots.forEach((slot: any, slotIndex: number) => {
        const newSlot = this.fb.group({
          id: [slot.id || ""],
          startTime: [slot.startTime || ""],
          endTime: [slot.endTime || ""],
          capacity: [slot.capacity !== null && slot.capacity !== undefined ? slot.capacity : (slot as any).maxCapacity || 0],
          prices: this.fb.array([]),
        });

        this.slots.push(newSlot);

        const ageTypeOrder: { [key: string]: number } = {
          'ADULT': 1,
          'CHILD': 2,
          'INFANT': 3,
          'ANY': 4
        };
        const sortedPrices = slot.prices ? [...slot.prices].sort((a: any, b: any) => {
          const typeA = typeof a.ageType === 'object' ? a.ageType.name : a.ageType;
          const typeB = typeof b.ageType === 'object' ? b.ageType.name : b.ageType;
          return (ageTypeOrder[typeA] || 99) - (ageTypeOrder[typeB] || 99);
        }) : [];

        sortedPrices.forEach((price: any, priceIndex: number) => {
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
    }
  }

  resetForm() {
    this.tourScheduleForm.reset();
    this.daysOfWeek.clear();
    this.slots.clear();
    this.addSlot();
    this.tourScheduleId = 0;
    this.tourSchedule = null;
    this.submitted = false;
    this.errorMessage = "";
  }

  resetFormExceptDates(isSingleDay: boolean = false) {
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
          this.openSnackBar(this.translate.instant("tour-schedule.messages.success"));
          this.getSchedules();
          this.resetForm();
        } else {
          this.errorMessage =
            this.translate.instant("tour-schedule.messages.error");
        }
      },
      error: (err) => {
        this.loading = false;
        console.error("Error saving tour schedule.");
        console.error(err);

        this.errorMessage = this.translate.instant("tour-schedule.messages.error");
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
          this.openSnackBar(this.translate.instant("tour-schedule.messages.errorGettingTour"));
        }
      },
      error: (err: any) => {
        console.error("Error getting tour.");
        console.error(err);
        this.tour = {};
        this.openSnackBar(this.translate.instant("tour-schedule.messages.errorGettingTour"));
      },
    });
  }

  getSchedules() {
    this.tourService.getSchedulesByTourId(this.tourId).subscribe({
      next: (data:TourScheduleConfigResponseDto[]) => {
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
          this.openSnackBar(this.translate.instant("tour-schedule.messages.errorGettingSchedules"));
        }
      },
      error: (err: any) => {
        console.error("Error getting tour schedules.");
        console.error(err);
        this.tourSchedules = [];
        this.openSnackBar(this.translate.instant("tour-schedule.messages.errorGettingSchedules"));
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

  saveTouryaPercentage(slot: any, scheduleId: number | null = null) {
    if (slot && slot.id !== undefined && slot.slotPorcentajeTourya !== undefined && scheduleId) {
      this.loading = true;
      this.tourService.updateSlotPercentage(this.tourId, slot.id, scheduleId, slot.slotPorcentajeTourya).subscribe({
        next: () => {
          this.loading = false;
          this.openSnackBar("Porcentaje actualizado correctamente");
          this.getSchedules();
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
          this.openSnackBar("Error al actualizar el porcentaje");
        }
      });
    } else {
      this.openSnackBar("El slot no tiene ID, porcentaje válido o no se pudo obtener el schedule");
    }
  }

  saveTouryaPercentageRange() {
    const startDateStr = this.tourScheduleForm.get("startDate")?.value;
    const endDateStr = this.tourScheduleForm.get("endDate")?.value;
    const touryaPercentage = this.tourScheduleForm.get("touryaPercentage")?.value;

    if (!startDateStr || !endDateStr || touryaPercentage === null || touryaPercentage === undefined || touryaPercentage === "") {
      this.openSnackBar("Por favor complete las fechas y el porcentaje");
      return;
    }

    const payload = {
      slotPercentageTourya: touryaPercentage,
      startDate: dayjs(startDateStr).format("YYYY-MM-DD"),
      endDate: dayjs(endDateStr).format("YYYY-MM-DD")
    };

    this.loading = true;
    this.tourService.updateTourPercentageByDateRange(this.tourId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.openSnackBar("Porcentaje actualizado correctamente para el rango de fechas");
        this.getSchedules();
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.openSnackBar("Error al actualizar el porcentaje en el rango");
      }
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
    if (this.calendarSelectedDate && isSameDay(this.calendarSelectedDate, date)) {
      // Clic en el mismo día → deseleccionar
      this.calendarSelectedDate = null;
      this.activeDayIsOpen = false;
      this.eventsOnSelectedDay = [];
    } else {
      // Clic en un día diferente → seleccionar ese día
      this.calendarSelectedDate = date;
      this.activeDayIsOpen = true;
      this.eventsOnSelectedDay = events;
    }

    this.viewDate = date;
    this.refresh.next();
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
    // El calendario grande solo resalta el único día seleccionado (calendarSelectedDate)
    if (this.calendarSelectedDate) {
      return isSameDay(date, this.calendarSelectedDate);
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
        this.openSnackBar(this.translate.instant("tour-schedule.messages.error"));
      }
    });
  }

  onTemplateSelectionChange(event: any): void {
    this.selectedTemplateId = event.value;
    this.selectedTemplate = this.templates.find(t => t.id === event.value) || null;
  }

  applyTemplate(): void {
    if (!this.selectedTemplate) {
      this.openSnackBar(this.translate.instant("tour-schedule.template.placeholder"));
      return;
    }

    // Preservar fechas actuales
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;

    // Limpiar el formulario actual
    this.resetForm();

    // Restaurar fechas
    if (startDate) {
      this.tourScheduleForm.get("startDate")?.setValue(startDate, { emitEvent: false });
    }
    if (endDate) {
      this.tourScheduleForm.get("endDate")?.setValue(endDate, { emitEvent: false });
    }

    // Sincronizar bsRangeValue para que el picker visualmente mantenga la selección
    if (startDate && endDate) {
      this.bsRangeValue = [dayjs(startDate).toDate(), dayjs(endDate).toDate()];
    }

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
      const sortedSlots = [...this.selectedTemplate.slots].sort((a: any, b: any) => {
        const timeA = a.startTime || "";
        const timeB = b.startTime || "";
        return timeA.localeCompare(timeB);
      });

      sortedSlots.forEach((slot: any, slotIndex: number) => {
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

        const ageTypeOrder: { [key: string]: number } = {
          'ADULT': 1,
          'CHILD': 2,
          'INFANT': 3,
          'ANY': 4
        };
        const sortedPrices = slot.prices ? [...slot.prices].sort((a: any, b: any) => {
          const typeA = typeof a.ageType === 'object' ? a.ageType.name : a.ageType;
          const typeB = typeof b.ageType === 'object' ? b.ageType.name : b.ageType;
          return (ageTypeOrder[typeA] || 99) - (ageTypeOrder[typeB] || 99);
        }) : [];

        // Procesar precios del slot
        sortedPrices.forEach((price: any, priceIndex: number) => {
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

    // Verificar si las fechas restauradas ya tienen horarios configurados con esta nueva configuración de días
    this.checkTourScheduleByStartDateAndEndDate();

    this.openSnackBar(this.translate.instant("tour-schedule.messages.success"));
  }

  // Método para guardar configuraciones por fecha usando batch
  saveTourScheduleBatch(): void {
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;
    const daysOfWeek = this.tourScheduleForm.get("daysOfWeek")?.value;
    const slots = this.tourScheduleForm.get("slots")?.value;

    if (!startDate || !endDate || !daysOfWeek || daysOfWeek.length === 0) {
      this.openSnackBar(this.translate.instant("tour-schedule.messages.error"));
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
        this.openSnackBar(this.translate.instant("tour-schedule.messages.success"));
        this.getSchedules();
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        console.error("Error saving batch tour schedules:", error);
        this.openSnackBar(this.translate.instant("tour-schedule.messages.error"));
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
      this.openSnackBar(this.translate.instant("tour-schedule.messages.error"));
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
        this.openSnackBar(this.translate.instant("tour-schedule.messages.success"));
        this.getSchedules();
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        console.error("Error updating batch tour schedules:", error);
        this.openSnackBar(this.translate.instant("tour-schedule.messages.error"));
      }
    });
  }

  // Métodos auxiliares para el template
  getDayAbbreviation(day: string): string {
    const translation = this.translate.instant('tour-schedule.config.daysOfWeek.' + day);
    return translation.substring(0, 3).toUpperCase();
  }

  getAgeTypeDisplay(ageType: any): string {
    if (typeof ageType === 'object' && ageType.name) {
      return ageType.name;
    }
    if (!ageType) return '';
    return this.translate.instant('tour-schedule.prices.ageType.' + ageType);
  }

  getSlotsByDate(event: any, date: Date): any[] {
    if (event.meta && event.meta.schedules) {
      const d = new Date(date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const foundSchedule = event.meta.schedules.find(
        (s: any) => s.scheduleDate === dateStr
      );
      if (foundSchedule && foundSchedule.config && foundSchedule.config.slots) {
        return foundSchedule.config.slots;
      }
    }
    return [];
  }

  getScheduleIdByDate(event: any, date: Date): number | null {
    if (event.meta && event.meta.schedules) {
      const d = new Date(date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const foundSchedule = event.meta.schedules.find(
        (s: any) => s.scheduleDate === dateStr
      );
      if (foundSchedule) {
        return foundSchedule.id;
      }
    }
    return null;
  }

  getDayMetrics(event: any, date: Date): { capacity: number, availability: number, bookings: number } | null {
    if (event.meta && event.meta.schedules) {
      const d = new Date(date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const foundSchedule = event.meta.schedules.find((s: any) => s.scheduleDate === dateStr);

      if (foundSchedule) {
        const slots: any[] = foundSchedule.config?.slots || [];
        // Capacidad total = suma de capacidades de cada slot
        const totalCapacity = slots.reduce((acc: number, s: any) => acc + (Number(s.capacity) || 0), 0);
        // Reservas reales = reservedCapacity del schedule (nivel día)
        const reserved = Number(foundSchedule.reservedCapacity) || 0;
        return {
          capacity: totalCapacity,
          bookings: reserved,
          availability: Math.max(0, totalCapacity - reserved)
        };
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
      if (this.calendarSelectedDate) {
        this.calendarSelectedDate = null;
        this.activeDayIsOpen = false;
        this.refresh.next();
      }
    }
  }

  isPast(date: Date): boolean {
    const today = dayjs().startOf('day');
    return dayjs(date).isBefore(today);
  }
}
