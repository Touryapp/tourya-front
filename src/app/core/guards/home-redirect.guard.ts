import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HomeRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    // Si está autenticado y es admin, redirigir al dashboard de admin
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
      return false;
    }

    // FE-15b: BACKOFFICE_OPERATION va directo al panel de reservas (subset P2 —
    // ver reservas es lo primero que necesitan al entrar). No debe ver el dashboard
    // admin (que aún incluye acciones exclusivas de ADMIN).
    if (this.authService.isBackofficeOperation()) {
      this.router.navigate(['/admin/bookings-management']);
      return false;
    }

    // Para todos los demás usuarios, permitir acceso normal a home
    return true;
  }
} 