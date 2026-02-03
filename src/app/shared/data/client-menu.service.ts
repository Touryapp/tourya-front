import { Injectable } from '@angular/core';
import { routes } from '../routes/routes';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ClientMenuItem {
  menuValue: string;
  route?: string;
  section?: string; // Nueva propiedad para identificar la sección
  hasSubRoute: boolean;
  showSubRoute: boolean;
  base?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  page?: string;
  last?: string;
  count?: string;
  subMenus?: ClientMenuItem[];
  icon?: string;
}

export interface ClientMenuSection {
  tittle: string;
  base: string;
  showAsTab: boolean;
  separateRoute: boolean;
  menu: ClientMenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ClientMenuService {
  private activeSectionSubject = new BehaviorSubject<string>('profile');
  public activeSection$ = this.activeSectionSubject.asObservable();

  public clientSidebarMenu: ClientMenuSection[] = [
    {
      tittle: 'Principal',
      base: 'clients',
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Mis Reservas',
          section: 'bookings',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'my-bookings',
          page: '',
          last: '',
          subMenus: [],
          icon: 'isax-calendar-tick5'
        },
        {
          menuValue: 'Mis Reseñas',
          section: 'reviews',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'review',
          page: '',
          last: '',
          subMenus: [],
          icon: 'isax-magic-star5'
        },
        {
          menuValue: 'Lista de Deseos',
          section: 'wishlist',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'wishlist',
          page: '',
          last: '',
          subMenus: [],
          icon: 'isax-heart5'
        }
      ]
    },
    {
      tittle: 'Cuenta',
      base: 'my-profile',
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Mi Perfil',
          section: 'profile',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'my-profile',
          page: '',
          last: '',
          subMenus: [],
          icon: 'isax-profile-tick5'
        },
        {
          menuValue: 'Créditos',
          section: 'credits',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'credits',
          page: '',
          last: '',
          subMenus: [],
          icon: 'isax-wallet-25'
        },
        {
          menuValue: 'Cerrar Sesión',
          route: routes.index,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index',
          page: '',
          last: '',
          subMenus: [],
          icon: 'isax-logout5'
        }
      ]
    }
  ];

  constructor() {}

  /**
   * Obtiene el menú completo para clientes
   */
  getClientMenu(): ClientMenuSection[] {
    return this.clientSidebarMenu;
  }

  /**
   * Obtiene una sección específica del menú
   */
  getMenuSection(sectionTitle: string): ClientMenuSection | undefined {
    return this.clientSidebarMenu.find(
      section => section.tittle.toLowerCase() === sectionTitle.toLowerCase()
    );
  }

  /**
   * Resetea el estado del menú (para uso en destroy)
   */
  resetMenuState(): void {
    this.clientSidebarMenu.forEach(section => {
      section.menu.forEach(item => {
        if (item.hasSubRoute) {
          item.showSubRoute = false;
        }
      });
    });
  }

  /**
   * Establece la sección activa
   */
  setActiveSection(section: string): void {
    this.activeSectionSubject.next(section);
  }

  /**
   * Obtiene la sección activa actual
   */
  getActiveSection(): string {
    return this.activeSectionSubject.value;
  }
}
