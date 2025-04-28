import { Component, NgZone, Renderer2 } from "@angular/core";
import { routes } from "../../shared/routes/routes";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";

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

  loginTouristForm: FormGroup;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  constructor(
    private router: Router,
    private renderer: Renderer2,
    private ngZone: NgZone
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

    if (this.loginTouristForm.valid) {
      this.ngZone.run(() => {
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(["home"]);
        }, 3000);
      });
    } else {
      this.loginTouristForm.markAllAsTouched();
      this.loading = false;
    }
  }
}
