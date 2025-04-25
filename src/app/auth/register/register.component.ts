import { Component, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { routes } from "../../shared/routes/routes";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../shared/validators/password-match.validator";

@Component({
  selector: "app-register",
  standalone: false,
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
})
export class RegisterComponent implements OnInit, OnDestroy {
  public routes = routes;
  loading: boolean = false;
  password: boolean[] = [false, false]; // Add more as needed
  registerForm: FormGroup;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    this.registerForm = new FormGroup(
      {
        name: new FormControl("", [
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

  navigation() {
    this.router.navigate([routes.index]);
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, "bg-light-200");

    this.registerForm.controls["password"];
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, "bg-light-200");
  }

  submitForm() {
    this.loading = true;

    if (this.registerForm.valid) {
      this.ngZone.run(() => {
        setTimeout(() => {
          this.loading = false;
          this.router.navigate([routes.myProfile]);
        }, 3000);
      });
    }
  }
}
