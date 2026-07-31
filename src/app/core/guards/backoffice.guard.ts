import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * FE-15b: guard permisivo que acepta ADMIN o BACKOFFICE_OPERATION.
 *
 * <p>Rutas del subset P2 opción C (Luis 2026-07-18): ver reservas, subir pagos,
 * gestionar reportes DIMAR. Para rutas que deben ser ADMIN puro (dashboard admin,
 * aprobar tours, editar comisión Tourya, app_config), seguir usando
 * {@link import('./admin.guard').AdminGuard}.</p>
 */
@Injectable({
  providedIn: 'root'
})
export class BackofficeGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const authed = this.authService.isAuthenticated();
    const isBO = this.authService.isTouryaBackoffice();
    // TC-008 #195 (4ta iter): logging de diagnostico.
    console.log('[TC-008 diag] BackofficeGuard: authenticated=', authed,
      ' isTouryaBackoffice=', isBO,
      ' user=', this.authService.getUser());

    if (!authed) {
      console.warn('[TC-008 diag] BackofficeGuard: no authenticated, redirigiendo a /');
      this.router.navigate(['/']);
      return false;
    }

    if (isBO) {
      return true;
    }

    console.warn('[TC-008 diag] BackofficeGuard: no es TouryaBackoffice, redirigiendo a /');
    this.router.navigate(['/']);
    return false;
  }
}
