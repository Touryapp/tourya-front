import { Component, OnDestroy, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { CommonService } from '../../../shared/common/common.service';
import { ClientMenuService, ClientMenuSection, ClientMenuItem } from '../../../shared/data/client-menu.service';

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

  constructor(
    private common: CommonService,
    private clientMenuService: ClientMenuService
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
          if (resMenu.menuValue === 'Mis Reservas') {
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
  }

  ngOnDestroy(): void {
    this.clientMenuService.resetMenuState();
  }
}
