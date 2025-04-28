import { Component, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { routes } from "../../shared/routes/routes";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../shared/validators/password-match.validator";
import { dayjsDateValidator } from "../../shared/validators/date-format.validator";
import { onlyNumberValidator } from "../../shared/validators/only-number.validator";

@Component({
  selector: "app-register-provider",
  standalone: false,
  templateUrl: "./register-provider.component.html",
  styleUrl: "./register-provider.component.scss",
})
export class RegisterProviderComponent implements OnInit, OnDestroy {
  public routes = routes;

  loading: boolean = false;
  password: boolean[] = [false, false]; // Add more as needed

  registerProviderForm: FormGroup;

  typeOfDocuments: any[] = [
    { id: 1, name: "DNI" },
    { id: 2, name: "Pasaporte" },
    { id: 3, name: "Cédula de identidad" },
    { id: 4, name: "RUT" },
  ];

  typeOfServices: any[] = [
    { id: 1, name: "Servicio A" },
    { id: 1, name: "Servicio B" },
    { id: 1, name: "Servicio C" },
  ];

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    this.registerProviderForm = new FormGroup(
      {
        names: new FormControl("", [
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

        typeOfService: new FormControl("", [Validators.required]),
      },
      { validators: [passwordMatchValidator("password", "confirmPassword")] }
    );
  }

  navigation() {
    this.router.navigate([routes.index]);
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, "bg-light-200");

    this.registerProviderForm
      .get("typeOfDocument")
      ?.valueChanges.subscribe((value) => {
        if (value) {
          if (!this.isValidTypeOfDocument) {
            this.registerProviderForm.get("typeOfDocument")?.setValue("");
          }
        }
      });

    this.registerProviderForm
      .get("typeOfService")
      ?.valueChanges.subscribe((value) => {
        if (value) {
          if (!this.isValidTypeOfService) {
            this.registerProviderForm.get("typeOfService")?.setValue("");
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, "bg-light-200");
  }

  submitForm() {
    this.loading = true;

    if (this.registerProviderForm.valid) {
      this.ngZone.run(() => {
        setTimeout(() => {
          this.loading = false;
          this.router.navigate([routes.myProfile]);
        }, 3000);
      });
    } else {
      this.registerProviderForm.markAllAsTouched();
      this.loading = false;
    }
  }

  get isValidTypeOfDocument(): boolean {
    const typeOfDocumentValue =
      +this.registerProviderForm.get("typeOfDocument")?.value;

    const found = this.typeOfDocuments.find(
      (typeOfDocument) => typeOfDocument.id === typeOfDocumentValue
    );

    return !!found;
  }

  get isValidTypeOfService(): boolean {
    const typeOfServiceValue =
      +this.registerProviderForm.get("typeOfService")?.value;

    const found = this.typeOfServices.find(
      (typeOfService) => typeOfService.id === typeOfServiceValue
    );

    return !!found;
  }

  onKeyPressDocumentNumber(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }
}
