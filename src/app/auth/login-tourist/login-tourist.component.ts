import { Component, NgZone, Renderer2 } from "@angular/core";
import { routes } from "../../shared/routes/routes";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { th } from "intl-tel-input/i18n";

@Component({
  selector: "app-login-tourist",
  templateUrl: "./login-tourist.component.html",
  styleUrl: "./login-tourist.component.scss",
  standalone: false,
})
export class LoginTouristComponent {
  public routes = routes;
  password: boolean[] = [false, false]; // Add more as needed

  loading: boolean = false;
  errorMessage: string = "";

  loginTouristForm: FormGroup;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  constructor(
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService
  ) {
    this.loginTouristForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
      ]),
      rememberMe: new FormControl(false),
    });
  }

  navigation() {
    this.router.navigate([routes.index]);
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

    if (this.loginTouristForm.valid) {
      const data = {
        email: this.loginTouristForm.get("email")?.value,
        password: this.loginTouristForm.get("password")?.value,
      };

      this.authService.login(data).subscribe({
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
        error: (err) => {
          this.loading = false;

          this.errorMessage =
            "Ha ocurrido un error, por favor intente de nuevo";
        },
      });
    } else {
      this.loginTouristForm.markAllAsTouched();
      this.loading = false;
    }
  }
}
