import { Component } from '@angular/core';
import { CommonService } from '../../shared/common/common.service';
import { SideBar2, SideBarMenu } from '../../shared/models/models';
import { DataService } from '../../shared/data/data.service';
import { routes } from '../../shared/routes/routes';

@Component({
  selector: 'app-agent',
  standalone: false,
  
  templateUrl: './agent.component.html',
  styleUrl: './agent.component.scss'
})
export class AgentComponent {
  routes =routes
  base = '';
  page = '';
  last = '';
  isSubdrop=false;
  side_bar_data: SideBar2[] = [];
  public sideBar2: Array<SideBar2> = [];
  constructor( private common: CommonService,private data: DataService ) {
    this.data.getSideBarData.subscribe((res: SideBar2[]) => {
      this.side_bar_data = res;
    });
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
      
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    this.sideBar2 = this.data.agentSideBar;
  }
  onOpen():void{
    this.isSubdrop=!this.isSubdrop;
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
          if (resMenu.menuValue === 'flight-booking'||'hotel-booking' ||'car-booking' ||'cruise-booking' ||'tour-booking') {
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

