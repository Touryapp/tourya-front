import { Component, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { routes } from "../../shared/routes/routes";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../shared/validators/password-match.validator";
import { AuthService } from "../auth.service";
import { RoleDto } from "../../shared/dto/role.dto";
@Component({
  selector: "app-register-tourist-email",
  standalone: false,
  templateUrl: "./register-tourist-email.component.html",
  styleUrl: "./register-tourist-email.component.scss",
})
export class RegisterTouristEmailComponent implements OnInit, OnDestroy {
  public routes = routes;

  loading: boolean = false;
  errorMessage: string = "";
  password: boolean[] = [false, false]; // Add more as needed

  registerTouristEmailForm: FormGroup;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService
  ) {
    this.registerTouristEmailForm = new FormGroup(
      {
        firstName: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        lastName: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmPassword: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
        terms: new FormControl(false, [Validators.requiredTrue]),
      },
      { validators: [passwordMatchValidator("password", "confirmPassword")] }
    );
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, "bg-light-200");
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, "bg-light-200");
  }

  submitForm() {
    this.loading = true;
    this.errorMessage = "";

    if (this.registerTouristEmailForm.valid) {
      const data = {
        firstname: this.registerTouristEmailForm.get("firstName")?.value,
        lastname: this.registerTouristEmailForm.get("lastName")?.value,
        email: this.registerTouristEmailForm.get("email")?.value,
        password: this.registerTouristEmailForm.get("password")?.value,
      };

      this.authService.register(data).subscribe({
        next: (response) => {
          this.loading = false;
          if (response && response.token) {
            this.authService.setToken(response.token);
            this.authService.setUser({
              fullName: response.fullName,
              email: response.email,
              roles: response.roles,
            });
            this.router.navigate(["home"]);
          } else {
            this.errorMessage =
              "Ha ocurrido un error, por favor intente de nuevo";
          }
        },
        error: (error) => {
          this.loading = false;

          if (error?.error?.statusCode === 409) {
            this.errorMessage = "Correo electrónico ya está registrado";
          } else if (error?.error?.statusCode === 400) {
            this.errorMessage = "Correo electrónico inválido";
          } else {
            this.errorMessage =
              "Ha ocurrido un error, por favor intente de nuevo";
          }
        },
      });
    } else {
      this.registerTouristEmailForm.markAllAsTouched();
      this.loading = false;
    }
  }
}
