import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

/**
 * TC-008 (#195 reabierto Luis 2026-08-04): shell del panel admin.
 *
 * <p>Antes era un `<router-outlet>` a secas y cada pantalla dibujaba su propio
 * sidebar (o no lo dibujaba). Ahora aporta un sidebar navegacional persistente
 * en TODAS las vistas admin excepto `/admin/dashboard` (que tiene su propio
 * sidebar con toggles internos). Items del sidebar dependen del rol: ADMIN ve
 * 8, BACKOFFICE_OPERATION (BO puro, sin ADMIN) ve 3.</p>
 *
 * <p><b>Regla de precedencia de roles</b>: si el usuario tiene ADMIN, gana ADMIN
 * (aunque tambien tenga BACKOFFICE_OPERATION). Solo un BO puro (sin ADMIN) ve
 * el sidebar reducido de 3 items. Ver `isAdmin` / `isBackofficeOnly` getters.</p>
 */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: false
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  showShellSidebar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Getters (no fields) para que el sidebar refleje siempre el rol actual del
   * usuario en localStorage. Si por alguna razon el token/rol cambia mientras
   * AdminComponent sigue vivo (ej: refresh post-login-BO despues de haber
   * entrado como ADMIN), la vista no queda pegada con el snapshot de ngOnInit.
   */
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isBackofficeOperation(): boolean {
    return this.authService.isBackofficeOperation();
  }

  /**
   * BO "puro" = tiene BACKOFFICE_OPERATION pero NO ADMIN. Solo estos usuarios
   * ven el sidebar reducido de 3 items. ADMIN + BO combinado sigue viendo el
   * sidebar de 8 items (ADMIN gana). Ver JSDoc de clase.
   */
  get isBackofficeOnly(): boolean {
    return this.isBackofficeOperation && !this.isAdmin;
  }

  ngOnInit(): void {
    this.recomputeShellSidebar(this.router.url);

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(e => this.recomputeShellSidebar(e.urlAfterRedirects || e.url));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sidebar visible en todas las rutas admin excepto /admin/dashboard (que ya
   * dibuja su propio sidebar con toggles). Evita mostrar dos sidebars.
   *
   * <p>Endurecido: normaliza trailing slash y query string antes de comparar,
   * asi `/admin/`, `/admin/bookings-management/`, y `/admin/bookings-management?x=1`
   * se comportan igual que sus equivalentes canonicos.</p>
   */
  private recomputeShellSidebar(url: string): void {
    const path = this.normalizePath(url);
    const isDashboard = path === '/admin/dashboard';
    const isAdminRoot = path === '/admin';
    this.showShellSidebar = path.startsWith('/admin/') && !isDashboard && !isAdminRoot;
  }

  private normalizePath(url: string): string {
    if (!url) return '';
    // Descarta query string y hash.
    let path = url.split('?')[0].split('#')[0];
    // Descarta trailing slash (excepto raiz).
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }

  /** ADMIN va al dashboard con la seccion Solicitudes activa. */
  goToDashboardSolicitudes(): void {
    this.router.navigate(['/admin/dashboard'], { queryParams: { section: 'solicitudes' } });
  }

  /** ADMIN va al dashboard con la seccion Gestion de Tours activa. */
  goToDashboardTours(): void {
    this.router.navigate(['/admin/dashboard'], { queryParams: { section: 'tours' } });
  }

  /** Reportes DIMAR: ruta propia (BackofficeGuard). */
  goToMaritimeReports(): void {
    this.router.navigate(['/admin/maritime-reports']);
  }

  /** Ordenes de pago: ruta propia (BackofficeGuard). */
  goToProviderPayments(): void {
    this.router.navigate(['/admin/provider-payments']);
  }

  /** Reservas cross-provider (BackofficeGuard). */
  goToBookingsManagement(): void {
    this.router.navigate(['/admin/bookings-management']);
  }

  /** Usuarios Backoffice (AdminGuard). */
  goToBackofficeUsers(): void {
    this.router.navigate(['/admin/backoffice-users']);
  }

  /** App config: dashboard con seccion appConfig. */
  goToDashboardAppConfig(): void {
    this.router.navigate(['/admin/dashboard'], { queryParams: { section: 'appConfig' } });
  }

  /** Volver al dashboard principal (sin section). */
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
