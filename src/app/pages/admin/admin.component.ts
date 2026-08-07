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
 * 8, BACKOFFICE_OPERATION ve 3.</p>
 */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: false
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  isAdmin = false;
  isBackofficeOperation = false;
  showShellSidebar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isBackofficeOperation = this.authService.isBackofficeOperation();
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
   */
  private recomputeShellSidebar(url: string): void {
    const path = (url || '').split('?')[0];
    this.showShellSidebar = path.startsWith('/admin')
      && !path.startsWith('/admin/dashboard')
      && path !== '/admin'
      && path !== '/admin/';
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
