import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Roles } from '../../shared/enums/roles.enum';
import { RoleDto } from '../../shared/dto/role.dto';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }

    // Obtener el usuario
    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/']);
      return false;
    }

    // Obtener la lista de roles (puede estar en roleList o roles)
    const roleList: RoleDto[] = user.roleList || user.roles || [];
    
    // Verificar si tiene el rol de admin
    const hasAdminRole = roleList.some((r: RoleDto) => r.id === Roles.ADMIN);
    
    if (hasAdminRole) {
      return true;
    }

    // Si no tiene permisos de admin, redirigir
    this.router.navigate(['/']);
    return false;
  }
} 