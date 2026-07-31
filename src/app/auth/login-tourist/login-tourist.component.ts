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
  showDisabledModal: boolean = false;
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
            this.authService.setTokensFromResponse(response);
            this.authService.setUser({
              fullName: response.fullName,
              email: response.email,
              roles: response.roleList,
            });
            // TC-008 #195 (4ta iter): diagnostico. Ver que roleList llega y como queda en localStorage.
            console.log('[TC-008 diag] login OK. roleList response=', response.roleList,
              ' mustChangePassword=', (response as any).mustChangePassword,
              ' user guardado=', this.authService.getUser(),
              ' isBackofficeOperation=', this.authService.isBackofficeOperation());
            this.getConsultDataAndRedirect(response.roleList);
          } else {
            this.errorMessage =
              "Ha ocurrido un error, por favor intente de nuevo";
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error de login:', err);

          if (err?.error?.errorCode === 303) {
            this.showDisabledModal = true;
          } else {
            this.errorMessage = "Ha ocurrido un error, por favor intente de nuevo";
          }
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
          this.authService.setTokensFromResponse(response);
          this.authService.setUser({
            fullName: response.fullName,
            email: response.email,
            roles: response.roleList,
          });
          this.googleLoading = false;
          this.getConsultDataAndRedirect(response.roleList);
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
          this.authService.setTokensFromResponse(response);
          this.authService.setUser({
            fullName: response.fullName,
            email: response.email,
            roles: response.roleList,
          });
          this.facebookLoading = false;
          this.getConsultDataAndRedirect(response.roleList);
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
    // TC-008 #195 (4ta iter): logging de diagnostico para detectar por que el redirect
    // no completa. Luis reporto que despues de "Redirigiendo basado en rol" la URL
    // sigue en /login. Este log muestra el path resuelto y el resultado de navigate().
    const roleIds = role.map(r => r.id);
    let target: string | null = null;
    if (role.some(r => r.id === Roles.ADMIN)) {
      target = "/admin";
    } else if (role.some(r => r.id === Roles.BACKOFFICE_OPERATION)) {
      // FE-15d fix (#195): sin este branch el user quedaba clavado en login post-auth.
      target = "/admin/bookings-management";
    } else if (role.some(r => r.id === Roles.PROVIDER || r.id === Roles.PROVIDER_OPERATOR)) {
      target = "/providers/provider-panel";
    } else if (role.some(r => r.id === Roles.USER)) {
      target = "/home";
    }

    console.log('[TC-008 diag] redirectByRole: roleIds=', roleIds, ' target=', target);
    if (target === null) {
      console.error('[TC-008 diag] redirectByRole: ningun branch matcheo. roleIds=', roleIds);
      return;
    }

    this.router.navigate([target]).then(
      ok => console.log('[TC-008 diag] navigate result:', ok, 'url ahora:', this.router.url),
      err => console.error('[TC-008 diag] navigate error:', err)
    );
  }

  getConsultDataAndRedirect(roleList: RoleDto[]) {
    console.log("Consultando datos de proveedor post-login");
    const isUser = roleList.some(r => r.id === Roles.USER);
    const isProvider = roleList.some(r => r.id === Roles.PROVIDER);
    const isOperator = roleList.some(r => r.id === Roles.PROVIDER_OPERATOR);
    const isProviderOrOperator = isProvider || isOperator;
    const isAdmin = roleList.some(r => r.id === Roles.ADMIN);

    if (isUser && !isProviderOrOperator && !isAdmin) {
      this.getPendingReviews();
    }

    const hasPendingAction = this.pendingActionService.hasPendingAction();

    this.requestProviderService.consultData().subscribe({
      next: (response) => {
        console.log('Datos de consulta recibidos:', response);
        let status = RequestsProvidersStatus.CREATED;
        if (response) {
          status = response.status as RequestsProvidersStatus;
          this.authService.setRequestProviderStatus(status);
          this.authService.setIdProvider(response.provider.id);
        } else {
          this.authService.setRequestProviderStatus(RequestsProvidersStatus.CREATED);
        }

        // Ejecutar navegación después de establecer el estado
        this.performNavigation(isProviderOrOperator, isAdmin, roleList, hasPendingAction, status);
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
        this.authService.setRequestProviderStatus(RequestsProvidersStatus.CREATED);
        
        // Ejecutar navegación con estado por defecto
        this.performNavigation(isProviderOrOperator, isAdmin, roleList, hasPendingAction, RequestsProvidersStatus.CREATED);
      }
    });
  }

  private performNavigation(isProviderOrOperator: boolean, isAdmin: boolean, roleList: RoleDto[], hasPendingAction: boolean, status: RequestsProvidersStatus) {
    const isOperator = roleList.some(r => r.id === Roles.PROVIDER_OPERATOR);
    
    if (isProviderOrOperator && !isAdmin) {
      if (status === RequestsProvidersStatus.APPROVED || isOperator) {
        console.log('👤 Redirigiendo proveedor a su panel');
        this.router.navigate(["providers/provider-panel"]);
      } else {
        console.log('👤 Redirigiendo proveedor no aprobado a su solicitud');
        this.router.navigate(["providers/requestproviders"]);
      }
    } else if (hasPendingAction) {
      const pendingAction = this.pendingActionService.getPendingCartAction();
      console.log('🔄 Redirigiendo a la página anterior con acción pendiente:', pendingAction);
      const returnUrl = pendingAction?.returnUrl || this.returnUrl || '/';
      this.router.navigateByUrl(returnUrl);
    } else if (this.returnUrl) {
      console.log('📍 Usando returnUrl del queryParam:', this.returnUrl);
      this.router.navigateByUrl(this.returnUrl);
    } else {
      console.log('👤 Redirigiendo basado en rol');
      this.redirectByRole(roleList);
    }
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

  closeDisabledModal() {
    this.showDisabledModal = false;
  }
}
