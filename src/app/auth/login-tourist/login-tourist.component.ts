import { Component, NgZone, Renderer2, OnInit } from "@angular/core";
import { routes } from "../../shared/routes/routes";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { SocialLoginDto } from "../../shared/dto/social-login.dto";
import { Roles } from "../../shared/enums/roles.enum";
import { RoleDto } from "../../shared/dto/role.dto";
import { RequestProvidersService } from "../../pages/providers/requestproviders/request-providers.service";
import { RequestsProvidersStatus } from "../../shared/enums/requests-providers-status.enum";

@Component({
  selector: "app-login-tourist",
  templateUrl: "./login-tourist.component.html",
  styleUrl: "./login-tourist.component.scss",
  standalone: false,
})
export class LoginTouristComponent implements OnInit {
  public routes = routes;
  password: boolean[] = [false, false]; // Add more as needed

  loading: boolean = false;
  errorMessage: string = "";
  googleLoading: boolean = false;
  facebookLoading: boolean = false;

  loginTouristForm: FormGroup;
  private returnUrl: string | null = null;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private authService: AuthService,
    private requestProviderService: RequestProvidersService
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

  ngOnInit(): void {
    // read returnUrl if present
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.renderer.addClass(document.body, "bg-light-200");
  }

  navigation() {
    this.router.navigate([routes.index]);
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
            this.getConsultData();
              // if returnUrl provided, navigate back there, otherwise use role-based redirect
              if (this.returnUrl) {
                this.router.navigateByUrl(this.returnUrl);
              } else {
                this.redirectByRole(response.roleList);
              }
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
          this.getConsultData();
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.redirectByRole(response.roleList);
          }
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
          this.getConsultData();
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.redirectByRole(response.roleList);
          }
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

  redirectByRole(role: RoleDto[]) {
    if (role.some(r => r.id === Roles.ADMIN)) {
      this.router.navigate(["admin"]);
    }else if (role.some(r => r.id === Roles.USER)) {
      this.router.navigate(["home"]);
    }
  }

  getConsultData(){
    this.requestProviderService.consultData().subscribe({
      next: (response) => {
        console.log(response);
        if(response){
          this.authService.setRequestProviderStatus(response.status as RequestsProvidersStatus);
          this.authService.setIdProvider(response.provider.id);
        }else{
          this.authService.setRequestProviderStatus(RequestsProvidersStatus.CREATED);
        }
      },
      error: (error) => {
        this.authService.setRequestProviderStatus(RequestsProvidersStatus.CREATED);
        console.error('Error al obtener los datos del usuario:', error);
      }
    })
  }
}
