import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { SideBar2, SideBarMenu, SubMenu, SubMenu2, SubMenuTwo } from '../../../shared/models/models';
import { CommonService } from '../../../shared/common/common.service';
import { DataService } from '../../../shared/data/data.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: false,
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {
  public routes = routes;
  base = '';
  page = '';
  last = '';
  isSubdrop: boolean = false; // Default state of submenu
  isOpen=false;
  side_bar_data: SideBar2[] = [];
  public sideBar2: Array<SideBar2> = [];
  shouldSubdrop(menu: any): boolean {
    return this.isSubdrop || this.page === 'customer-flight-booking';
}
  constructor(
    private common: CommonService,
    private data: DataService
  ) {
    this.data.getSideBarData.subscribe((res: SideBar2[]) => {
      this.side_bar_data = res;
    });
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });
    this.sideBar2 = this.data.sideBar2;
    
  }
onOpen():void{
  this.isSubdrop=!this.isSubdrop;
}
toggleSubmenu(menu: any): void {
  if (this.page === 'customer-flight-booking') {
      this.isSubdrop = !this.isSubdrop;
  } else {
      this.isSubdrop = !this.isSubdrop; // Reset when not on specific page
  }
}
public expandSubMenus(menu: any): void {
  sessionStorage.setItem('menuValue', menu.menuValue);
  this.sideBar2.map((mainMenus: any) => {
    mainMenus.menu.map((resMenu: any) => {
      // collapse other submenus which are open
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
  if(activeMenu === null) {
    this.sideBar2.map((mainMenus: any) => {
      mainMenus.menu.map((resMenu: any) => {
        // collapse other submenus which are open
        if (resMenu.menuValue === 'customer-flight-booking'||'customer-hotel-booking' ||'customer-car-booking' ||'customer-cruise-booking' ||'customer-tour-booking') {
          resMenu.showSubRoute = true;

        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }
  this.sideBar2.map((mainMenus: SideBar2) => {
    mainMenus.menu.map((resMenu: SideBarMenu) => {
      // collapse other submenus which are open
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
  this.data.resetData2();
}
}
