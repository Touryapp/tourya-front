import { Component, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { routes } from "../../shared/routes/routes";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../shared/validators/password-match.validator";
@Component({
  selector: "app-register-tourist-email",
  standalone: false,
  templateUrl: "./register-tourist-email.component.html",
  styleUrl: "./register-tourist-email.component.scss",
})
export class RegisterTouristEmailComponent implements OnInit, OnDestroy {
  public routes = routes;

  loading: boolean = false;
  password: boolean[] = [false, false]; // Add more as needed

  registerTouristEmailForm: FormGroup;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    this.registerTouristEmailForm = new FormGroup(
      {
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

    if (this.registerTouristEmailForm.valid) {
      this.ngZone.run(() => {
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(["home"]);
        }, 3000);
      });
    } else {
      this.registerTouristEmailForm.markAllAsTouched();
      this.loading = false;
    }
  }
}
