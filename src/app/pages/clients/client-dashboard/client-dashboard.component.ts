import { Component, OnDestroy, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { CommonService } from '../../../shared/common/common.service';
import { ClientMenuService, ClientMenuSection, ClientMenuItem } from '../../../shared/data/client-menu.service';
import { TouristService } from '../../../shared/services/tourist.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: false,
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  public routes = routes;
  base = '';
  page = '';
  last = '';
  isSubdrop: boolean = false;
  isOpen = false;
  clientSidebarMenu: ClientMenuSection[] = [];
  
  // Perfil del cliente
  clientFirstName: string = 'Usuario';
  clientLastName: string = '';
  clientPhotoUrl: string = 'assets/img/users/user-01.jpg';
  clientSinceDate: string = '';

  constructor(
    private common: CommonService,
    private clientMenuService: ClientMenuService,
    private touristService: TouristService
  ) {
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });
    this.clientSidebarMenu = this.clientMenuService.getClientMenu();
  }

  shouldSubdrop(menu: any): boolean {
    return this.isSubdrop || this.page === 'customer-tour-booking';
  }

  onOpen(): void {
    this.isSubdrop = !this.isSubdrop;
  }

  toggleSubmenu(menu: any): void {
    this.isSubdrop = !this.isSubdrop;
  }

  public expandSubMenus(menu: ClientMenuItem): void {
    sessionStorage.setItem('menuValue', menu.menuValue);
    
    // Si el men\u00fa tiene una secci\u00f3n (no redirecciona), cambiar la secci\u00f3n activa
    if (menu.section) {
      this.clientMenuService.setActiveSection(menu.section);
    }
    
    this.clientSidebarMenu.map((mainMenus: ClientMenuSection) => {
      mainMenus.menu.map((resMenu: ClientMenuItem) => {
        if (resMenu.menuValue === menu.menuValue) {
          menu.showSubRoute = !menu.showSubRoute;
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }

  public expandSubMenusActive(): void {
    const activeMenu = sessionStorage.getItem('menuValue');
    if (activeMenu === null) {
      this.clientSidebarMenu.map((mainMenus: ClientMenuSection) => {
        mainMenus.menu.map((resMenu: ClientMenuItem) => {
          if (resMenu.menuValue === 'clientSidebar.myBookings') {
            resMenu.showSubRoute = true;
          } else {
            resMenu.showSubRoute = false;
          }
        });
      });
    }
    this.clientSidebarMenu.map((mainMenus: ClientMenuSection) => {
      mainMenus.menu.map((resMenu: ClientMenuItem) => {
        if (resMenu.menuValue === activeMenu) {
          resMenu.showSubRoute = true;
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }

  ngOnInit(): void {
    this.expandSubMenusActive();
    this.loadClientProfile();
  }

  private loadClientProfile(): void {
    this.touristService.getProfile().subscribe({
      next: (profile) => {
        if (profile.firstName) {
          this.clientFirstName = profile.firstName;
        }
        if (profile.lastName) {
          this.clientLastName = profile.lastName;
        }
        if (profile.photoUrl) {
          this.clientPhotoUrl = profile.photoUrl;
        }
      },
      error: (error) => {
        console.error('Error cargando perfil del cliente', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.clientMenuService.resetMenuState();
  }
}
