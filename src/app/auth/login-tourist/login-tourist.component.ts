import { Component, NgZone, Renderer2, OnInit, OnDestroy } from "@angular/core";
import { routes } from "../../shared/routes/routes";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { SocialLoginDto } from "../../shared/dto/social-login.dto";
import { Roles } from "../../shared/enums/roles.enum";
import { RoleDto } from "../../shared/dto/role.dto";
import { RequestProvidersService } from "../../pages/providers/requestproviders/request-providers.service";
import { RequestsProvidersStatus } from "../../shared/enums/requests-providers-status.enum";
import { ReviewsService } from "../../core/services/reviews.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { PendingReviewsModalComponent } from "../../shared/components/pending-reviews-modal/pending-reviews-modal.component";
import { PendingActionService } from "../../shared/services/pending-action.service";

@Component({
  selector: "app-login-tourist",
  templateUrl: "./login-tourist.component.html",
  styleUrl: "./login-tourist.component.scss",
  standalone: false,
})
export class LoginTouristComponent implements OnInit, OnDestroy {
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
    private requestProviderService: RequestProvidersService,
    private reviewsService: ReviewsService,
    private modalService: BsModalService,
    private pendingActionService: PendingActionService
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
            const isUser = response.roleList.some(r => r.id === Roles.USER);
            const isProvider = response.roleList.some(r => r.id === Roles.PROVIDER);
            const isAdmin = response.roleList.some(r => r.id === Roles.ADMIN);

            if (isUser && !isProvider && !isAdmin) {
              this.getPendingReviews();
            }
            // Verificar si hay acción pendiente
            const hasPendingAction = this.pendingActionService.hasPendingAction();
            console.log(`✅ Login exitoso - ¿Hay acción pendiente? ${hasPendingAction}`);

            if (hasPendingAction) {
              const pendingAction = this.pendingActionService.getPendingCartAction();
              console.log('🔄 Redirigiendo a la página anterior con acción pendiente:', pendingAction);
              console.log('📍 URL de retorno:', pendingAction?.returnUrl);

              // Redirigir a la URL de retorno (donde estaba el modal)
              // El modal detectará automáticamente la acción pendiente y la ejecutará
              const returnUrl = pendingAction?.returnUrl || this.returnUrl || '/';
              console.log('🚀 Navegando a:', returnUrl);
              this.router.navigateByUrl(returnUrl);
            } else if (this.returnUrl) {
              // returnUrl provided sin acción pendiente
              console.log('📍 Usando returnUrl del queryParam:', this.returnUrl);
              this.router.navigateByUrl(this.returnUrl);
            } else {
              // Redirect basado en rol
              console.log('👤 Redirigiendo basado en rol');
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
      const userData: SocialLoginDto = {
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
          const isUser = response.roleList.some(r => r.id === Roles.USER);
          const isProvider = response.roleList.some(r => r.id === Roles.PROVIDER);
          const isAdmin = response.roleList.some(r => r.id === Roles.ADMIN);

          if (isUser && !isProvider && !isAdmin) {
            this.getPendingReviews();
          }

          // Verificar si hay acción pendiente
          const hasPendingAction = this.pendingActionService.hasPendingAction();
          console.log(`✅ Login Google exitoso - ¿Hay acción pendiente? ${hasPendingAction}`);

          if (hasPendingAction) {
            const pendingAction = this.pendingActionService.getPendingCartAction();
            console.log('🔄 Redirigiendo a la página anterior con acción pendiente:', pendingAction);
            console.log('📍 URL de retorno:', pendingAction?.returnUrl);
            const returnUrl = pendingAction?.returnUrl || this.returnUrl || '/';
            console.log('🚀 Navegando a:', returnUrl);
            this.router.navigateByUrl(returnUrl);
          } else if (this.returnUrl) {
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
      const userData: SocialLoginDto = {
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
          const isUser = response.roleList.some(r => r.id === Roles.USER);
          const isProvider = response.roleList.some(r => r.id === Roles.PROVIDER);
          const isAdmin = response.roleList.some(r => r.id === Roles.ADMIN);

          if (isUser && !isProvider && !isAdmin) {
            this.getPendingReviews();
          }

          // Verificar si hay acción pendiente
          const hasPendingAction = this.pendingActionService.hasPendingAction();
          console.log(`✅ Login Facebook exitoso - ¿Hay acción pendiente? ${hasPendingAction}`);

          if (hasPendingAction) {
            const pendingAction = this.pendingActionService.getPendingCartAction();
            console.log('🔄 Redirigiendo a la página anterior con acción pendiente:', pendingAction);
            console.log('📍 URL de retorno:', pendingAction?.returnUrl);
            const returnUrl = pendingAction?.returnUrl || this.returnUrl || '/';
            console.log('🚀 Navegando a:', returnUrl);
            this.router.navigateByUrl(returnUrl);
          } else if (this.returnUrl) {
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
    } else if (role.some(r => r.id === Roles.USER)) {
      this.router.navigate(["home"]);
    }
  }

  getConsultData() {
    console.log("Consultando datos");

    this.requestProviderService.consultData().subscribe({
      next: (response) => {
        console.log(response);
        if (response) {
          this.authService.setRequestProviderStatus(response.status as RequestsProvidersStatus);
          this.authService.setIdProvider(response.provider.id);
        } else {
          this.authService.setRequestProviderStatus(RequestsProvidersStatus.CREATED);
        }
      },
      error: (error) => {
        this.authService.setRequestProviderStatus(RequestsProvidersStatus.CREATED);
        console.error('Error al obtener los datos del usuario:', error);
      }
    })
  }
  getPendingReviews() {
    this.reviewsService.getPendingReviews().subscribe({
      next: (response) => {
        console.log(response);
        if (response && response.content && response.content.length > 0) {
          console.log("Mostrando modal");

          const initialState = {
            pendingReviews: response.content
          };
          this.modalService.show(PendingReviewsModalComponent, { initialState, class: 'modal-lg', backdrop: 'static', keyboard: false });
        }
      },
      error: (error) => {
        console.error('Error al obtener las revisiones pendientes:', error);
      }
    })
  }
}
