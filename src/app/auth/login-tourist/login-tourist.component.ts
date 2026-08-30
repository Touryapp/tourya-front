import { AfterViewInit, Component, ElementRef, NgZone, Renderer2, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { routes } from "../../shared/routes/routes";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { Roles } from "../../shared/enums/roles.enum";
import { RoleDto } from "../../shared/dto/role.dto";
import { RequestProvidersService } from "../../pages/providers/requestproviders/request-providers.service";
import { RequestsProvidersStatus } from "../../shared/enums/requests-providers-status.enum";
import { ReviewsService } from "../../core/services/reviews.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { PendingReviewsModalComponent } from "../../shared/components/pending-reviews-modal/pending-reviews-modal.component";
import { PendingActionService } from "../../shared/services/pending-action.service";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../environments/environment";

declare const google: any;
declare const FB: any;

const GOOGLE_GIS_SCRIPT_ID = "google-gsi-client";
const FACEBOOK_SDK_SCRIPT_ID = "facebook-jssdk";

@Component({
  selector: "app-login-tourist",
  templateUrl: "./login-tourist.component.html",
  styleUrl: "./login-tourist.component.scss",
  standalone: false,
})
export class LoginTouristComponent implements OnInit, AfterViewInit, OnDestroy {
  public routes = routes;
  password: boolean[] = [false, false]; // Add more as needed

  loading: boolean = false;
  showDisabledModal: boolean = false;
  errorMessage: string = "";
  googleLoading: boolean = false;
  facebookLoading: boolean = false;

  loginTouristForm: FormGroup;
  private returnUrl: string | null = null;

  // SEC-06 / FE-02: contenedor donde Google Identity Services renderiza su
  // boton oficial. Reemplaza al boton custom porque el flujo id_token de GIS
  // requiere que el click provenga del boton oficial (limitacion de la libreria).
  @ViewChild('googleSignInBtn', { static: false }) googleSignInBtn?: ElementRef<HTMLDivElement>;

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
    private pendingActionService: PendingActionService,
    private translate: TranslateService
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

  ngAfterViewInit(): void {
    // SEC-06 / FE-02: cargar Google Identity Services y Facebook JS SDK bajo
    // demanda. Solo se cargan cuando el usuario abre el login, no en toda la
    // app. Ambos scripts son inyectados dinamicamente en el <head>, evitando
    // sumar peso a index.html.
    this.loadGoogleIdentityServices()
      .then(() => this.setupGoogleButton())
      .catch((err) => console.error('Google Identity Services no pudo cargarse', err));
    this.loadFacebookSdk()
      .catch((err) => console.error('Facebook JS SDK no pudo cargarse', err));
  }

  navigation() {
    this.router.navigate([routes.index]);
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, "bg-light-200");
  }

  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        resolve();
        return;
      }
      if (document.getElementById(GOOGLE_GIS_SCRIPT_ID)) {
        const check = setInterval(() => {
          if (typeof google !== 'undefined' && google?.accounts?.id) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('GIS timeout')); }, 10000);
        return;
      }
      const script = document.createElement('script');
      script.id = GOOGLE_GIS_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('GIS load error'));
      document.head.appendChild(script);
    });
  }

  private setupGoogleButton(): void {
    if (!google?.accounts?.id || !this.googleSignInBtn) {
      return;
    }
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => {
        this.ngZone.run(() => this.handleGoogleCredential(response.credential));
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    google.accounts.id.renderButton(this.googleSignInBtn.nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 240,
    });
  }

  private loadFacebookSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof FB !== 'undefined') {
        resolve();
        return;
      }
      if (document.getElementById(FACEBOOK_SDK_SCRIPT_ID)) {
        const check = setInterval(() => {
          if (typeof FB !== 'undefined') {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('FB SDK timeout')); }, 10000);
        return;
      }
      (window as any).fbAsyncInit = () => {
        (window as any).FB.init({
          appId: environment.facebookAppId,
          cookie: true,
          xfbml: false,
          version: 'v18.0',
        });
        resolve();
      };
      const script = document.createElement('script');
      script.id = FACEBOOK_SDK_SCRIPT_ID;
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => reject(new Error('FB SDK load error'));
      document.head.appendChild(script);
    });
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
            this.errorMessage = this.translate.instant("auth.login.errors.generic");
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error de login:', err);

          if (err?.error?.errorCode === 303) {
            this.showDisabledModal = true;
          } else {
            this.errorMessage = this.translate.instant("auth.login.errors.generic");
          }
        },
      });
    } else {
      this.loginTouristForm.markAllAsTouched();
      this.loading = false;
    }
  }

  /**
   * SEC-06 / FE-02: callback que dispara GIS cuando el usuario completa el flujo
   * de Google. `credential` es el id_token JWT firmado por Google. Se envia al
   * backend, que lo valida contra las claves publicas de Google y devuelve el
   * JWT propio de Tourya.
   */
  private handleGoogleCredential(idToken: string): void {
    if (!idToken) {
      this.errorMessage = this.translate.instant("auth.login.errors.generic");
      return;
    }
    this.googleLoading = true;
    this.errorMessage = "";
    this.authService.authenticateWithGoogle(idToken).subscribe({
      next: (response) => {
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
        this.errorMessage = this.translate.instant("auth.login.errors.generic");
      }
    });
  }

  /**
   * SEC-06 / FE-02: dispara el flujo de Facebook JS SDK. Al aceptar, `FB.login`
   * retorna un accessToken que se envia al backend para validar contra la
   * Graph API antes de emitir el JWT propio.
   */
  signInWithFacebook(): void {
    if (typeof FB === 'undefined') {
      this.errorMessage = this.translate.instant("auth.login.errors.generic");
      return;
    }
    this.facebookLoading = true;
    this.errorMessage = "";
    FB.login((response: any) => {
      this.ngZone.run(() => this.handleFacebookLogin(response));
    }, { scope: 'email,public_profile' });
  }

  private handleFacebookLogin(response: any): void {
    if (response?.status !== 'connected' || !response.authResponse?.accessToken) {
      this.facebookLoading = false;
      if (response?.status !== 'unknown') {
        this.errorMessage = this.translate.instant("auth.login.errors.generic");
      }
      return;
    }
    const accessToken = response.authResponse.accessToken;
    this.authService.authenticateWithFacebook(accessToken).subscribe({
      next: (backendResponse) => {
        this.authService.setTokensFromResponse(backendResponse);
        this.authService.setUser({
          fullName: backendResponse.fullName,
          email: backendResponse.email,
          roles: backendResponse.roleList,
        });
        this.facebookLoading = false;
        this.getConsultDataAndRedirect(backendResponse.roleList);
      },
      error: (err) => {
        console.error('Error en autenticación con Facebook:', err);
        this.facebookLoading = false;
        this.errorMessage = this.translate.instant("auth.login.errors.generic");
      }
    });
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
