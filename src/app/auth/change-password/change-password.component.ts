import { Component, NgZone, Renderer2 } from "@angular/core";
import { routes } from "../../shared/routes/routes";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  public routes = routes
   password: boolean[] = [false, false]; // Add more as needed

   loading: boolean = false;

   changePasswordForm: FormGroup;
 
   messageAlert: string = "" ;

   togglePassword(index: number): void {
     this.password[index] = !this.password[index];
   }
   constructor(
     private router: Router,
     private renderer:Renderer2,
     private ngZone: NgZone,

   ){

    this.changePasswordForm = new FormGroup({
      newPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
    });

   }
   navigation(){
     this.router.navigate([routes.index])
   }
   ngOnInit(): void {
     this.renderer.addClass(document.body, 'bg-light-200');
   }
   ngOnDestroy(): void {
     this.renderer.removeClass(document.body, 'bg-light-200');
   }

   submitForm() {
    this.loading = true;
    this.messageAlert = "";

    if (this.changePasswordForm.valid) {
      const { newPassword, confirmPassword } = this.changePasswordForm.value;
      if (newPassword === confirmPassword) {
        this.ngZone.run(() => {
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(["home"]);
          }, 3000);
        });
      } else {
        // alert("Las contraseñas no coinciden");
        this.messageAlert = "Las contraseñas no coinciden";
        this.loading = false;
      }
    } else {
      this.changePasswordForm.markAllAsTouched();
      this.loading = false;
    }
  }

}

