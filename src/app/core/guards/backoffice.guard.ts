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
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }

    if (this.authService.isTouryaBackoffice()) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
