import { Component, NgZone, Renderer2 } from "@angular/core";
import { routes } from "../../shared/routes/routes";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { SocialLoginDto } from "../../shared/dto/social-login.dto";

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
  googleLoading: boolean = false;
  facebookLoading: boolean = false;

  loginTouristForm: FormGroup;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  constructor(
    private router: Router,
    private renderer: Renderer2,
    private ngZone: NgZone,
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
              roles: response.roleList,
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

  // Método para iniciar sesión con Google
  async signInWithGoogle(): Promise<void> {
    try {
      this.googleLoading = true;
      const result = await this.authService.loginWithGoogle();
      
      // Obtener datos del usuario
      const user = result.user;
      console.log('Usuario de Google:', user);
      
       // Obtener token de autenticación
       const token = await user.getIdToken();
       console.log('Token:', token);
      // Datos básicos del usuario que podemos usar
      const userData:SocialLoginDto = {
        firstname: user.displayName || '',
        lastname: '',
        email: user.email || '',
        uuidSocial: user.uid || '',
      };
      
      await this.authService.authenticateSocial(userData).subscribe({
        next: (response) => {
          console.log('Respuesta de Google:', response)
          this.authService.setToken(response.token);
          this.authService.setUser({
            fullName: response.fullName,
            email: response.email,
            roles: response.roleList,
          });
          this.googleLoading = false;
          this.router.navigate(["home"]);
        },
        error: (err) => {
          console.error('Error en autenticación con Google:', err);
          this.googleLoading = false;
        }
      });
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
      this.googleLoading = false;
    }
  }

  // Método para iniciar sesión con Facebook
  async signInWithFacebook(): Promise<void> {
    try {
      this.facebookLoading = true;
      const result = await this.authService.loginWithFacebook();
      
      // Obtener datos del usuario
      const user = result.user;
      console.log('Usuario de Facebook:', user);
      // Obtener token de autenticación
      const token = await user.getIdToken();
      console.log('Token de Facebook:', token);
      // Datos básicos del usuario
      const userData:SocialLoginDto = {
        firstname: user.displayName || '',
        lastname: '',
        email: user.email || '',
        uuidSocial: user.uid || '',
      };
      
      await this.authService.authenticateSocial(userData).subscribe({
        next: (response) => {
          // Navegar a la página principal
          console.log('Respuesta de Facebook:', response)
          this.authService.setToken(response.token);
          this.authService.setUser({
            fullName: response.fullName,
            email: response.email,
            roles: response.roleList,
          });
          this.facebookLoading = false;
          this.router.navigate(["home"]);
        },
        error: (err) => {
          console.error('Error en autenticación con Facebook:', err);
          this.facebookLoading = false;
        }
      });
      
    } catch (error) {
      console.error('Error en autenticación con Facebook:', error);
      this.facebookLoading = false;
    }
  }
}
