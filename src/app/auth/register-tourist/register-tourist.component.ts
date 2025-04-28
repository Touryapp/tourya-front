import { Component, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { routes } from "../../shared/routes/routes";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../shared/validators/password-match.validator";
import { dayjsDateValidator } from "../../shared/validators/date-format.validator";
import { onlyNumberValidator } from "../../shared/validators/only-number.validator";

@Component({
  selector: "app-register-tourist",
  standalone: false,
  templateUrl: "./register-tourist.component.html",
  styleUrl: "./register-tourist.component.scss",
})
export class RegisterTouristComponent implements OnInit, OnDestroy {
  public routes = routes;

  loading: boolean = false;
  password: boolean[] = [false, false]; // Add more as needed

  registerTouristForm: FormGroup;

  bsValue = undefined;
  maxDate = new Date();

  typeOfDocuments: any[] = [
    { id: 1, name: "DNI" },
    { id: 2, name: "Pasaporte" },
    { id: 3, name: "Cédula de identidad" },
    { id: 4, name: "RUT" },
  ];

  genders: any[] = [
    { id: 1, name: "Masculino" },
    { id: 2, name: "Femenino" },
    { id: 3, name: "No binario" },
    { id: 4, name: "Prefiero no decirlo" },
  ];

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    this.registerTouristForm = new FormGroup(
      {
        names: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        surnames: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        typeOfDocument: new FormControl("", [Validators.required]),
        documentNumber: new FormControl("", [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(10),
          onlyNumberValidator(),
        ]),
        birthdate: new FormControl("", [
          Validators.required,
          dayjsDateValidator("DD-MM-YYYY"),
        ]),
        gender: new FormControl("", [Validators.required]),
        phone: new FormControl("", [Validators.required]),
        city: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        address: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
      },
      { validators: [passwordMatchValidator("password", "confirmPassword")] }
    );
  }

  navigation() {
    this.router.navigate([routes.index]);
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, "bg-light-200");

    this.registerTouristForm
      .get("typeOfDocument")
      ?.valueChanges.subscribe((value) => {
        if (value) {
          if (!this.isValidTypeOfDocument) {
            this.registerTouristForm.get("typeOfDocument")?.setValue("");
          }
        }
      });

    this.registerTouristForm.get("gender")?.valueChanges.subscribe((value) => {
      if (value) {
        if (!this.isValidGender) {
          this.registerTouristForm.get("gender")?.setValue("");
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, "bg-light-200");
  }

  submitForm() {
    this.loading = true;

    if (this.registerTouristForm.valid) {
      this.ngZone.run(() => {
        setTimeout(() => {
          this.loading = false;
          this.router.navigate([routes.myProfile]);
        }, 3000);
      });
    } else {
      this.registerTouristForm.markAllAsTouched();
      this.loading = false;
    }
  }

  get isValidTypeOfDocument(): boolean {
    const typeOfDocumentValue =
      +this.registerTouristForm.get("typeOfDocument")?.value;

    const found = this.typeOfDocuments.find(
      (typeOfDocument) => typeOfDocument.id === typeOfDocumentValue
    );

    return !!found;
  }

  get isValidGender(): boolean {
    const genderValue = +this.registerTouristForm.get("gender")?.value;

    const found = this.genders.find((gender) => gender.id === genderValue);

    return !!found;
  }

  onKeypressDateTimePicker(event: KeyboardEvent) {
    return false;
  }

  onKeydownDateTimePicker(event: KeyboardEvent) {
    if (event.key === "Backspace") {
      this.registerTouristForm.get("birthdate")?.setValue("");
    }
  }

  onKeyPressDocumentNumber(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }
}
