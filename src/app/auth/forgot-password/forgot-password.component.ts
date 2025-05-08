import { Component, NgZone, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";


@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
 routes=routes;

 forgotPasswordForm: FormGroup;
 loading: boolean = false;
 messageAlert: string = "" ;

   constructor(
    
     private router: Router,
     private renderer: Renderer2,
     private ngZone: NgZone
   ){
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
   }
   ngOnInit(): void {
    this.renderer.addClass(document.body, 'bg-light-200');
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'bg-light-200');
  }

  submitForm() {
    this.loading = true;

    if (this.forgotPasswordForm.valid) {
      this.ngZone.run(() => {
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(["home"]);
        }, 3000);
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
      this.loading = false;
    }
  }
}
