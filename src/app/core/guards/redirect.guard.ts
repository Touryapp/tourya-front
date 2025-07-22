import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Roles } from '../../shared/enums/roles.enum';
import { RoleDto } from '../../shared/dto/role.dto';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar si está autenticado
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getUser();
      
      if (user) {
        // Obtener la lista de roles (puede estar en roleList o roles)
        const roleList: RoleDto[] = user.roleList || user.roles || [];
        
        // Si es admin, redirigir al dashboard de admin
        const hasAdminRole = roleList.some((r: RoleDto) => r.id === Roles.ADMIN);
        
        if (hasAdminRole) {
          this.router.navigate(['/admin']);
          return false; // Bloquear la navegación original para hacer la redirección
        }
      }
    }
    
    // Para todos los demás casos (usuarios normales o no autenticados), redirigir a home
    this.router.navigate(['/home']);
    return false; // Bloquear la navegación original para hacer la redirección
  }
} 