import { Component, HostListener } from "@angular/core";
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

@Component({
  selector: "app-tour-schedule",
  standalone: false,
  templateUrl: "./tour-schedule.component.html",
  styleUrl: "./tour-schedule.component.scss",
})
export class TourScheduleComponent {
  public routes = routes;
  loading = false;
  tourScheduleForm: FormGroup;
  readonly TypeOfPersonLabel = TypeOfPersonLabel;

  tourId: number = 0;
  tour: Tour | null = null;
  tourSchedules: TourSchedule[] = [];
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

  view: CalendarView = CalendarView.Month;
  viewDate: Date = dayjs().hour(0).minute(0).second(0).millisecond(0).toDate();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  refresh = new Subject<void>();

  allMonthSelected: boolean = false;

  // Propiedades para templates
  templates: TourSchedule[] = [];
  selectedTemplateId: number | null = null;
  selectedTemplate: TourSchedule | null = null;
  templatesLoading = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tourService: TourService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private templateService: TemplateService,
    private authService: AuthService
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
      isUnlimitedCapacity: [false, [Validators.required]],
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

    this.tourScheduleForm
      .get("isUnlimitedCapacity")
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.slots.controls.forEach((control, index) => {
            const maxCapacityControl = control.get("maxCapacity");

            maxCapacityControl?.setValue("");
            maxCapacityControl?.setValidators([]);
            maxCapacityControl?.updateValueAndValidity();
          });
        } else {
          this.slots.controls.forEach((control, index) => {
            const maxCapacityControl = control.get("maxCapacity");

            maxCapacityControl?.setValidators([
              Validators.required,
              onlyNumberValidator(),
            ]);

            maxCapacityControl?.updateValueAndValidity();
          });
        }
      });

    this.slots.valueChanges.subscribe((value) => {
      this.slots.controls.forEach((control, index) => {
        // Check min capacity
        if (!this.tourScheduleForm.get("isUnlimitedCapacity")?.value) {
          const minCapacityControl = control.get("minCapacity");
          const maxCapacityControl = control.get("maxCapacity");

          const minCapacityValue = +(minCapacityControl?.value || 0);
          const maxCapacityValue = +(maxCapacityControl?.value || 0);

          if (minCapacityValue > maxCapacityValue) {
            maxCapacityControl?.setErrors({ min: true });
          }
        }

        // Check min age
        this.prices(index).controls.forEach((priceControl, indexPrice) => {
          const minAgeControl = priceControl.get("minAge");
          const maxAgeControl = priceControl.get("maxAge");

          const minAgeValue = +minAgeControl?.value || 0;
          const maxAgeValue = +maxAgeControl?.value || 0;

          if (minAgeValue > maxAgeValue) {
            maxAgeControl?.setErrors({
              min: true,
            });
          }
        });
      });
    });
  }

  ngOnDestroy(): void {}

  onKeypressMinCapacity(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeypressMaxCapacity(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeypressMinAge(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeypressMaxAge(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPriceBlur(indexSlot: number, indexPrice: number) {
    const priceControl = this.prices(indexSlot).at(indexPrice).get("price");
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

  checkMinMaxAge(indexSlot: number, indexPrice: number) {
    const minAgeControl = this.prices(indexSlot).at(indexPrice).get("minAge");
    const maxAgeControl = this.prices(indexSlot).at(indexPrice).get("maxAge");

    const minAgeValue = +minAgeControl?.value || 0;
    const maxAgeValue = +maxAgeControl?.value || 0;

    if (minAgeValue >= 0 && maxAgeValue >= 0 && minAgeValue > maxAgeValue) {
      maxAgeControl?.setErrors({
        min: true,
      });
    }
  }

  get slots(): FormArray {
    return this.tourScheduleForm.get("slots") as FormArray;
  }

  newSlot(): FormGroup {
    const isUnlimitedCapacityValue = this.tourScheduleForm.get(
      "isUnlimitedCapacity"
    )?.value;

    const maxCapacityValidators = isUnlimitedCapacityValue
      ? []
      : [Validators.required, onlyNumberValidator()];

    return this.fb.group({
      id: ["", []],
      startTime: ["", [Validators.required]],
      endTime: ["", [Validators.required]],
      minCapacity: ["", [Validators.required, onlyNumberValidator()]],
      maxCapacity: ["", maxCapacityValidators],
      prices: this.fb.array([]),
    });
  }

  addSlot() {
    if (this.slots.valid) {
      this.slots.push(this.newSlot());
      this.prices(this.slots.length - 1).push(this.newPrice());
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
      minAge: [
        "",
        [Validators.required, Validators.min(0), onlyNumberValidator()],
      ],
      maxAge: [
        "",
        [Validators.required, Validators.min(0), onlyNumberValidator()],
      ],
      price: ["", [Validators.required, Validators.min(0)]],
    });
  }

  addPrice(index: number) {
    if (this.prices(index).valid) {
      this.prices(index).push(this.newPrice());
    } else {
      this.prices(index).markAllAsTouched();
    }
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

  checkTourScheduleByStartDateAndEndDate() {
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;

    const startDateDayJs = dayjs(startDate);
    const endDateDayJs = dayjs(endDate);

    if (startDate && endDate) {
      const startDateFormatted = startDateDayJs.format("YYYY-MM-DD");
      const endDateFormatted = endDateDayJs.format("YYYY-MM-DD");

      const found = this.tourSchedules.find((schedule) => {
        return (
          schedule.startDate &&
          schedule.endDate &&
          schedule.startDate === startDateFormatted &&
          schedule.endDate === endDateFormatted
        );
      });

      if (found && found.id) {
        this.openSnackBarWithAction(
          "There is a configuration that meets these dates. Would you like to edit the configuration?",
          "Edit",
          found.id
        );
      }
    }
  }

  loadConfig(id: number) {
    const found = this.tourSchedules.find((schedule) => schedule.id === id);

    if (found && found.id) {
      this.tourScheduleId = found.id;
      this.tourSchedule = found;

      this.tourScheduleForm.patchValue({
        label: found.label,
        isUnlimitedCapacity: found.isUnlimitedCapacity,
      });

      found.daysOfWeek.map((dayOfWeek) => {
        this.daysOfWeek.push(new FormControl(dayOfWeek));
      });

      found?.slots?.map((slot, index) => {
        if (index >= 1) {
          this.addSlot();
        }

        this.slots.at(index).patchValue({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          minCapacity: slot.minCapacity,
          maxCapacity: slot.maxCapacity,
        });

        slot.prices?.map((price, indexPrice) => {
          if (indexPrice >= 1) {
            this.addPrice(index);
          }

          this.prices(index).at(indexPrice).patchValue({
            id: price.id,
            ageType: price.ageType,
            minAge: price.minAge,
            maxAge: price.maxAge,
            price: price.price,
          });
        });
      });
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

  saveTourSchedule() {
    const {
      label,
      startDate,
      endDate,
      daysOfWeek,
      isUnlimitedCapacity,
      slots,
    } = this.tourScheduleForm.value;

    const body = {
      tourId: this.tourId,
      label,
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      daysOfWeek,
      isUnlimitedCapacity,
      slots,
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
    const {
      label,
      startDate,
      endDate,
      daysOfWeek,
      isUnlimitedCapacity,
      slots,
    } = this.tourScheduleForm.value;

    const body = {
      tourId: this.tourId,
      label,
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      daysOfWeek,
      isUnlimitedCapacity,
      slots,
      createdBy: 1,
    };

    this.tourService.updateTourSchedule(this.tourScheduleId, body).subscribe({
      next: (data) => {
        this.loading = false;

        if (data) {
          this.openSnackBar("Tour schedule edited successfully.");
          this.getSchedules();
          this.resetForm();
        } else {
          this.errorMessage =
            "Ha ocurrido un error, por favor intente de nuevo";
        }
      },
      error: (err) => {
        this.loading = false;
        console.error("Error updating tour schedule.");
        console.error(err);

        this.errorMessage = "Ha ocurrido un error, por favor intente de nuevo";
      },
    });
  }

  getTour() {
    this.tourService.getTourById(this.tourId).subscribe({
      next: (data: Tour) => {
        if (data) {
          this.tour = data;
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
    this.tourService.getSchedulesByTourId(this.tourId).subscribe({
      next: (data: {
        content: TourSchedule[];
        totalElements: number;
        totalPages: number;
      }) => {
        if (data && data.content) {
          this.tourSchedules = data.content;
          const events: any[] = this.tourSchedules
            .map((schedule) => {
              const startDateDayJs = dayjs(schedule.startDate, "YYYY-MM-DD");
              const endDateDayJs = dayjs(schedule.endDate, "YYYY-MM-DD");

              const daysDifference = endDateDayJs.diff(startDateDayJs, "day");
              let acc: any[] = [];

              const color = {
                primary: this.getRandomHexColor(),
                secondary: this.getRandomHexColor(),
              };
              for (let i = 0; i <= daysDifference; i++) {
                const newStartDate = startDateDayJs.add(i, "day");
                const newEndDate = startDateDayJs.add(i, "day");
                const day = newStartDate.day();

                const isDayOfWeekSelected = schedule.daysOfWeek.find(
                  (dayOfWeek) => {
                    return dayOfWeek === this.DAYS_OF_WEEK[day].value;
                  }
                );

                if (
                  isDayOfWeekSelected &&
                  newStartDate.isValid() &&
                  newEndDate.isValid()
                ) {
                  acc = [
                    ...acc,
                    {
                      start: new Date(newStartDate.toISOString()),
                      end: new Date(newEndDate.toISOString()),
                      title: schedule.label,
                      draggable: false,
                      color: {
                        ...color,
                      },
                      allDay: true,
                      meta: {
                        tourScheduleId: schedule.id,
                        tourId: this.tourId,
                        startDate: schedule.startDate,
                        endDate: schedule.endDate,
                        daysOfWeek: schedule.daysOfWeek,
                        isUnlimitedCapacity: schedule.isUnlimitedCapacity,
                        slots: schedule.slots,
                      },
                    },
                  ];
                }
              }

              return acc.length > 0 ? acc : null;
            })
            .filter((v) => v);

          const events2 = events.reduce((acc, current, value, index) => {
            if (current) {
              acc = [...acc, ...current];
            }
            return acc;
          }, []);

          this.events = events2;

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
      if (!startDateValue) {
        startDateControl?.setValue(date);
      } else {
        if (
          startDateDayJs.isSame(endDateDayJs) &&
          startDateDayJs.isSame(dateDayJs)
        ) {
          startDateControl?.setValue(null);
          endDateControl?.setValue(null);
        } else if (endDateDayJs.isSame(dateDayJs)) {
          endDateControl?.setValue(null);
        } else {
          if (dateDayJs.isSame(startDateDayJs, "month")) {
            if (dateDayJs.isBefore(startDateDayJs)) {
              startDateControl?.setValue(date);
              endDateControl?.setValue(startDateValue);
            } else {
              startDateControl?.setValue(startDateValue);
              endDateControl?.setValue(date);
            }
          } else {
            startDateControl?.setValue(date);
            endDateControl?.setValue(null);
          }
        }
      }
    }

    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
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
      isUnlimitedCapacity: this.selectedTemplate.isUnlimitedCapacity,
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
          minCapacity: [slot.minCapacity || ""],
          maxCapacity: [slot.maxCapacity || ""],
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
            minAge: [price.minAge || ""],
            maxAge: [price.maxAge || ""],
            price: [price.price || ""],
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
          const startTimeParts = slot.startTime.split(":");
          const endTimeParts = slot.endTime.split(":");

          const batchEntry = {
            tourId: this.tourId,
            scheduleDate: scheduleDate,
            startTime: {
              hour: parseInt(startTimeParts[0]),
              minute: parseInt(startTimeParts[1]),
              second: 0,
              nano: 0
            },
            endTime: {
              hour: parseInt(endTimeParts[0]),
              minute: parseInt(endTimeParts[1]),
              second: 0,
              nano: 0
            },
            maxCapacity: slot.maxCapacity || 0,
            reservedCapacity: 0,
            isUnlimitedCapacity: this.tourScheduleForm.get("isUnlimitedCapacity")?.value,
            status: "available",
            config: {
              tourId: this.tourId,
              providerId: this.authService.getIdProvider(),
              label: this.tourScheduleForm.get("label")?.value,
              startDate: startDateDayJs.format("YYYY-MM-DD"),
              endDate: endDateDayJs.format("YYYY-MM-DD"),
              daysOfWeek: daysOfWeek,
              isUnlimitedCapacity: this.tourScheduleForm.get("isUnlimitedCapacity")?.value,
              isTemplate: false,
              slots: slots.map((s: any) => ({
                startTime: {
                  hour: parseInt(s.startTime.split(":")[0]),
                  minute: parseInt(s.startTime.split(":")[1]),
                  second: 0,
                  nano: 0
                },
                endTime: {
                  hour: parseInt(s.endTime.split(":")[0]),
                  minute: parseInt(s.endTime.split(":")[1]),
                  second: 0,
                  nano: 0
                },
                minCapacity: s.minCapacity,
                maxCapacity: s.maxCapacity,
                prices: s.prices.map((p: any) => ({
                  ageType: p.ageType,
                  minAge: p.minAge,
                  maxAge: p.maxAge,
                  price: p.price
                }))
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
}
