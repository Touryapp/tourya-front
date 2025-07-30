import { Component, HostListener } from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { ActivatedRoute, Router } from "@angular/router";
import { TypeOfPerson } from "../../../../shared/enums/type-of-person.enum";
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

  tabs = [
    { id: "basic_info", label: "Tour Schedule Config" },
    { id: "slots", label: "Slots" },
  ];

  activeTab: string = this.tabs[0].id; // Default to the first tab

  readonly TypeOfPerson = TypeOfPerson;

  tourId: number = 0;
  tour: Tour | null = null;
  tourSchedules: TourSchedule[] = [];
  tourSchedule: TourSchedule | null = null;
  tourScheduleId: number = 0;

  submitted: boolean = false;

  errorMessage: string = "";

  bsValueStartDate = undefined;
  bsValueEndDate = undefined;
  minDateStartDate: Date = new Date();
  minDateEndDate: Date | undefined = undefined;
  maxDateEndDate: Date | undefined = undefined;

  DAYS_OF_WEEK = [
    { label: "SUNDAY", value: "SUNDAY" },
    { label: "MONDAY", value: "MONDAY" },
    { label: "TUESDAY", value: "TUESDAY" },
    { label: "WEDNESDAY", value: "WEDNESDAY" },
    { label: "THURSDAY", value: "THURSDAY" },
    { label: "FRIDAY", value: "FRIDAY" },
    { label: "SATURDAY", value: "SATURDAY" },
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tourService: TourService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
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
    } else {
      this.router.navigate(["/providers/provider-panel"]);
    }
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    this.tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) {
        const sectionTop = element.offsetTop - 100; // Adjust offset for fixed headers
        const sectionBottom = sectionTop + element.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          this.activeTab = tab.id;
        }
      }
    });
  }

  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      this.activeTab = id; // Update the active tab

      setTimeout(() => {
        window.scrollTo(0, element.offsetTop - 75);
      }, 0);
    }
  }

  onSubmit() {
    this.loading = true;
    this.submitted = true;
    this.tourScheduleForm.markAllAsTouched();

    if (this.tourScheduleForm.valid) {
      if (this.tourScheduleId) {
        this.updateTourSchedule();
      } else {
        this.saveTourSchedule();
      }
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.tourScheduleForm
      .get("startDate")
      ?.valueChanges.subscribe((startDate) => {
        const startDateDayjs = dayjs(startDate);
        this.minDateEndDate = startDate;

        const lastDayOfMonth = startDateDayjs.endOf("month");
        this.maxDateEndDate = lastDayOfMonth.toDate();

        const endDateControl = this.tourScheduleForm.get("endDate");
        const endDate = endDateControl?.value;
        const endDateDayjs = dayjs(endDate);

        if (
          (endDate && startDateDayjs.isAfter(endDateDayjs)) ||
          endDateDayjs.isAfter(lastDayOfMonth)
        ) {
          endDateControl?.setErrors({
            invalidRangeDate: true,
          });
        }

        this.checkTourScheduleByStartDateAndEndDate();
      });

    this.tourScheduleForm.get("endDate")?.valueChanges.subscribe((endDate) => {
      this.checkTourScheduleByStartDateAndEndDate();
    });

    this.tourScheduleForm
      .get("isUnlimitedCapacity")
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.slots.controls.forEach((control, index) => {
            const maxCapacityControl = control.get("maxCapacity");

            maxCapacityControl?.setValidators([onlyNumberValidator()]);
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
        const minCapacityControl = control.get("minCapacity");
        const maxCapacityControl = control.get("maxCapacity");

        const minCapacityValue = +(minCapacityControl?.value || 0);
        const maxCapacityValue = +(maxCapacityControl?.value || 0);

        if (minCapacityValue > maxCapacityValue) {
          maxCapacityControl?.setErrors({ min: true });
        } else {
          maxCapacityControl?.setErrors(null);
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
          } else {
            maxAgeControl?.setErrors(null);
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

  onAgeTypeBlur(indexSlot: number, indexPrice: number, event: FocusEvent) {
    this.prices(indexSlot)
      .at(indexPrice)
      .get("ageType")
      ?.setValue((event.target as HTMLInputElement).value.trim());
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

    const maxCapacityValidators = [
      isUnlimitedCapacityValue ? Validators.required : undefined,
      onlyNumberValidator(),
    ].filter((v) => v);

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
    if (event.checked) {
      this.daysOfWeek.push(new FormControl(day));
    } else {
      this.daysOfWeek.controls.forEach((control: AbstractControl, index) => {
        if (control.value === day) {
          this.daysOfWeek.removeAt(index);
          return;
        }
      });
    }
  }

  isDaySelected(day: string): boolean {
    return this.daysOfWeek.controls.some(
      (control: AbstractControl) => control.value === day
    );
  }

  typeOfPersonIsSelected(typeOfPerson: TypeOfPerson, i: number): boolean {
    const typesOfPeople = this.slots.controls
      .map((control, index) => {
        if (index !== i) {
          return (control as FormGroup).get("typeOfPerson")?.value;
        }
      })
      .filter((v) => v);

    return typesOfPeople.includes(typeOfPerson);
  }

  checkTourScheduleByStartDateAndEndDate() {
    const startDate = this.tourScheduleForm.get("startDate")?.value;
    const endDate = this.tourScheduleForm.get("endDate")?.value;

    const startDateDayjs = dayjs(startDate);
    const endDateDayjs = dayjs(endDate);

    if (startDate && endDate) {
      const startDateFormatted = startDateDayjs.format("YYYY-MM-DD");
      const endDateFormatted = endDateDayjs.format("YYYY-MM-DD");

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
      startDate,
      endDate,
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
      startDate,
      endDate,
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

  openSnackBarWithAction(
    message: string,
    action: string,
    tourScheduleId: number
  ) {
    const snackBarRef = this._snackBar.open(message, action, {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      this.loadConfig(tourScheduleId);
      // Perform your action here (e.g., undo the archived message)
    });
  }
}
