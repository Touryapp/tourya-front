import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TemplateService } from "../template.service";
import { TourSchedule } from "../../../../shared/dto/tour-schedule.response.dto";
import { TypeOfPersonLabel } from "../../../../shared/enums/type-of-person.enum";
import { onlyNumberValidator } from "../../../../shared/validators/only-number.validator";
import { routes } from "../../../../shared/routes/routes";
import { AuthService } from "../../../../core/services/auth.service";
import { CreateTourSchedule } from "../../../../shared/dto/create-tour-schedule.dto";
@Component({
  selector: "app-template-form",
  standalone: false,
  templateUrl: "./template-form.component.html",
  styleUrl: "./template-form.component.scss"
})
export class TemplateFormComponent implements OnInit {
  templateForm: FormGroup;
  loading = false;
  submitted = false;
  isEditMode = false;
  templateId: number | null = null;
  readonly TypeOfPersonLabel = TypeOfPersonLabel;
  public routes = routes;

  DAYS_OF_WEEK = [
    { label: "DOMINGO", value: "SUNDAY", day: 0 },
    { label: "LUNES", value: "MONDAY", day: 1 },
    { label: "MARTES", value: "TUESDAY", day: 2 },
    { label: "MIÉRCOLES", value: "WEDNESDAY", day: 3 },
    { label: "JUEVES", value: "THURSDAY", day: 4 },
    { label: "VIERNES", value: "FRIDAY", day: 5 },
    { label: "SÁBADO", value: "SATURDAY", day: 6 },
  ];

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.templateForm = this.fb.group({
      label: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      daysOfWeek: this.fb.array([]),
      isUnlimitedCapacity: [false, [Validators.required]],
      slots: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get("id") ? 
      +this.route.snapshot.paramMap.get("id")! : null;
    
    this.isEditMode = !!this.templateId;

    if (this.isEditMode && this.templateId) {
      this.loadTemplate(this.templateId);
    } else {
      this.addSlot();
    }

    this.setupFormSubscriptions();
  }

  setupFormSubscriptions(): void {
    this.templateForm.get("isUnlimitedCapacity")?.valueChanges.subscribe((value) => {
      if (value) {
        this.slots.controls.forEach((control) => {
          const maxCapacityControl = control.get("maxCapacity");
          maxCapacityControl?.setValue("");
          maxCapacityControl?.setValidators([]);
          maxCapacityControl?.updateValueAndValidity();
        });
      } else {
        this.slots.controls.forEach((control) => {
          const maxCapacityControl = control.get("maxCapacity");
          maxCapacityControl?.setValidators([
            Validators.required,
            onlyNumberValidator(),
          ]);
          maxCapacityControl?.updateValueAndValidity();
        });
      }
    });

    this.slots.valueChanges.subscribe(() => {
      this.slots.controls.forEach((control, index) => {
        // Check min capacity
        if (!this.templateForm.get("isUnlimitedCapacity")?.value) {
          const minCapacityControl = control.get("minCapacity");
          const maxCapacityControl = control.get("maxCapacity");

          const minCapacityValue = +(minCapacityControl?.value || 0);
          const maxCapacityValue = +(maxCapacityControl?.value || 0);

          if (minCapacityValue > maxCapacityValue) {
            maxCapacityControl?.setErrors({ min: true });
          }
        }

        // Check min age
        this.prices(index).controls.forEach((priceControl) => {
          const minAgeControl = priceControl.get("minAge");
          const maxAgeControl = priceControl.get("maxAge");

          const minAgeValue = +minAgeControl?.value || 0;
          const maxAgeValue = +maxAgeControl?.value || 0;

          if (minAgeValue > maxAgeValue) {
            maxAgeControl?.setErrors({ min: true });
          }
        });
      });
    });
  }

  loadTemplate(templateId: number): void {
    this.loading = true;
    this.templateService.getTemplateById(templateId).subscribe({
      next: (template) => {
        this.templateForm.patchValue({
          label: template.label,
          isUnlimitedCapacity: template.isUnlimitedCapacity,
        });

        // Limpiar y reconstruir días de la semana
        this.daysOfWeek.clear();
        template.daysOfWeek.forEach((dayOfWeek) => {
          this.daysOfWeek.push(this.fb.control(dayOfWeek));
        });

        // Limpiar y reconstruir slots completamente
        this.slots.clear();
        
        template.slots?.forEach((slot, slotIndex) => {
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

        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading template:", error);
        this.loading = false;
        this.showSnackBar("Error al cargar el template", "error");
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.submitted = true;
    this.templateForm.markAllAsTouched();
    this.daysOfWeek.markAllAsTouched();
    this.daysOfWeek.markAsDirty();

    if (this.daysOfWeek.length === 0) {
      this.templateForm.get("daysOfWeek")?.setErrors({ required: true });
    }

    if (this.templateForm.valid) {
      const formData = this.templateForm.value;
      const providerId = this.authService.getIdProvider();
      if (!providerId) {
        this.showSnackBar("Error: No se pudo obtener el ID del proveedor", "error");
        this.loading = false;
        return;
      }

      const templateData: any = {
        tourId: 0, // Para templates no necesitamos tourId
        providerId: providerId, // ID del proveedor actual
        label: formData.label,
        daysOfWeek: formData.daysOfWeek,
        isUnlimitedCapacity: formData.isUnlimitedCapacity,
        slots: formData.slots,
        isTemplate: true, // Marcar como template
        createdBy: 1,
      };

      if (this.isEditMode && this.templateId) {
        this.updateTemplate(templateData);
      } else {
        this.createTemplate(templateData);
      }
    } else {
      this.loading = false;
    }
  }

  createTemplate(templateData: any): void {
    this.templateService.createTemplate(templateData).subscribe({
      next: () => {
        this.loading = false;
        this.showSnackBar("Template creado correctamente", "success");
        this.router.navigate(["/providers/templates"]);
      },
      error: (error) => {
        console.error("Error creating template:", error);
        this.loading = false;
        this.showSnackBar("Error al crear el template", "error");
      }
    });
  }

  updateTemplate(templateData: any): void {
    this.templateService.updateTemplate(this.templateId!, templateData).subscribe({
      next: () => {
        this.loading = false;
        this.showSnackBar("Template actualizado correctamente", "success");
        this.router.navigate(["/providers/templates"]);
      },
      error: (error) => {
        console.error("Error updating template:", error);
        this.loading = false;
        this.showSnackBar("Error al actualizar el template", "error");
      }
    });
  }

  resetForm(): void {
    this.templateForm.reset();
    this.daysOfWeek.clear();
    this.slots.clear();
    this.addSlot();
    this.submitted = false;
  }

  // Getters para el formulario
  get slots(): FormArray {
    return this.templateForm.get("slots") as FormArray;
  }

  get daysOfWeek(): FormArray {
    return this.templateForm.get("daysOfWeek") as FormArray;
  }

  // Métodos para slots
  newSlot(): FormGroup {
    const isUnlimitedCapacityValue = this.templateForm.get("isUnlimitedCapacity")?.value;
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

  addSlot(): void {
    if (this.slots.valid) {
      this.slots.push(this.newSlot());
      this.prices(this.slots.length - 1).push(this.newPrice());
    } else {
      this.slots.markAllAsTouched();
    }
  }

  removeSlot(index: number): void {
    this.slots.removeAt(index);
    this.slots.markAsDirty();
  }

  // Métodos para precios
  prices(index: number): FormArray {
    return this.slots.at(index).get("prices") as FormArray;
  }

  newPrice(): FormGroup {
    return this.fb.group({
      id: ["", []],
      ageType: ["", [Validators.required]],
      minAge: ["", [Validators.required, Validators.min(0), onlyNumberValidator()]],
      maxAge: ["", [Validators.required, Validators.min(0), onlyNumberValidator()]],
      price: ["", [Validators.required, Validators.min(0)]],
    });
  }

  addPrice(index: number): void {
    if (this.prices(index).valid) {
      this.prices(index).push(this.newPrice());
    } else {
      this.prices(index).markAllAsTouched();
    }
  }

  removePrice(indexSlot: number, indexPrice: number): void {
    this.prices(indexSlot).removeAt(indexPrice);
    this.prices(indexSlot).markAsDirty();
  }

  // Métodos para días de la semana
  onDayChange(day: string, event: any): void {
    this.daysOfWeek.markAllAsTouched();
    this.daysOfWeek.markAsDirty();

    if (event.checked) {
      this.daysOfWeek.push(this.fb.control(day));
    } else {
      this.daysOfWeek.controls.forEach((control, index) => {
        if (control.value === day) {
          this.daysOfWeek.removeAt(index);
          return;
        }
      });

      if (this.daysOfWeek.length === 0) {
        this.templateForm.get("daysOfWeek")?.setErrors({ required: true });
      }
    }
  }

  isDaySelected(day: string): boolean {
    return this.daysOfWeek.controls.some((control) => control.value === day);
  }

  // Validaciones
  typeOfPersonIsSelected(typeOfPerson: TypeOfPersonLabel, indexSlot: number, indexPrice: number): boolean {
    const typesOfPeople = this.prices(indexSlot)
      .controls.map((control, index) => {
        if (index !== indexPrice) {
          return (control as FormGroup).get("ageType")?.value;
        }
      })
      .filter((v) => v);

    return typesOfPeople.includes(typeOfPerson);
  }

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

  onPriceBlur(indexSlot: number, indexPrice: number): void {
    const priceControl = this.prices(indexSlot).at(indexPrice).get("price");
    const price = priceControl?.value;

    let displayPrice: number = 0;
    if (price) {
      displayPrice = parseFloat(price);
    }
    priceControl?.setValue(displayPrice);
  }

  onLabelBlur(event: FocusEvent): void {
    this.templateForm
      .get("label")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onStartTimeBlur(index: number): void {
    this.checkTimeRange(index);
  }

  onEndTimeBlur(index: number): void {
    this.checkTimeRange(index);
  }

  checkTimeRange(index: number): void {
    const startTimeControl = this.slots.at(index).get("startTime");
    const endTimeControl = this.slots.at(index).get("endTime");

    const startTime = startTimeControl?.value;
    const endTime = endTimeControl?.value;

    if (startTime && endTime) {
      const startTimeSplit = startTime.split(":");
      const endtimeSplit = endTime.split(":");

      const startTimeMoment = new Date();
      startTimeMoment.setHours(parseInt(startTimeSplit[0]), parseInt(startTimeSplit[1]));

      const endTimeMoment = new Date();
      endTimeMoment.setHours(parseInt(endtimeSplit[0]), parseInt(endtimeSplit[1]));

      if (startTimeMoment >= endTimeMoment) {
        endTimeControl?.setErrors({ invalidRangeTime: true });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/providers/templates']);
  }

  private showSnackBar(message: string, type: "success" | "error"): void {
    this.snackBar.open(message, "", {
      duration: 3000,
      panelClass: type === "success" ? "success-snackbar" : "error-snackbar"
    });
  }
}
