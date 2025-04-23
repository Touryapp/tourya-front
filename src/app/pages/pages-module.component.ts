import { Component, ViewEncapsulation , OnInit, HostListener } from '@angular/core';
import { CommonService } from '../shared/common/common.service';
import { SettingService } from '../shared/settings/settings.service';
import { DataService } from '../shared/data/data.service';
import { SideBarService } from '../shared/side-bar/side-bar.service';
import * as Aos from 'aos';
@Component({
    selector: 'app-pages-module',
    templateUrl: './pages-module.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class PagesModuleComponent implements OnInit{
  base = '';
  page = '';
  last = '';
  public miniSidebar = false;
  public expandMenu = false;
  public mobileSidebar = false;
  layoutMode = '1';
  layoutWidth = '1';
  sidebarSize = '1';
  topbarColor='white';
  primaryColor='1';
  withoutWrapperPagesArray = ['login','register', 'forgot-password', 'change-password','under-construction','under-maintenance','coming-soon','error-404','error-500'];
  withoutWrapperPages:boolean|null = false;
  withoutLayouts:boolean|null = false;
  showPreloader = false;
  showPreloaderState = '';
  isHovered=false;
  isShow=false;
  selectedColor = '84, 109, 254, 1';
  selectedColor1 = '555, 555, 555, 1';
  horizontalColor='555, 555, 555, 1';
  dthemeColor= '84, 109, 254, 1';
  showBackToTop: boolean = false;
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Show the button after scrolling 200px down
    this.showBackToTop = window.scrollY > 200;
    this.isShow=true;
  }

  // Scroll to the top of the page
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  }
  constructor(
    private common: CommonService,
    public settings: SettingService,
    private data: DataService,
    private sideBar: SideBarService,
  ) {
    this.settings.isLoader.subscribe((res: string) => {
      this.showPreloaderState = res;
    });
    this.common.base.subscribe((res: string) => {
      this.base = res;
      this.withoutWrapperPages = this.withoutWrapperPagesArray.includes(this.base);
      this.scrollToTop();
    //Loader
      if(this.showPreloaderState === '1'){
        this.showPreloader = true;
        setTimeout(() => {
          this.showPreloader = false;
        }, 2000);
      }else {
        this.showPreloader = false;
      }
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res === 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });

    this.sideBar.toggleMobileSideBar.subscribe((res: string) => {
      if (res == 'true' || res == 'true') {
        this.mobileSidebar = true;
      } else {
        this.mobileSidebar = false;
      }
    });
    this.sideBar.expandSideBar.subscribe((res) => {
      this.expandMenu = res;

    });
  }
  isCollapsed = false;
  ngOnInit(){
    this.data.collapse$.subscribe((collapse: boolean) => {
      this.isCollapsed = collapse;
    
    });

    //custom-cursor
    const cursorElement: HTMLElement | null = document.querySelector('.tx-js-cursor');

    window.addEventListener('mousemove', (event: MouseEvent) => {
      if (cursorElement) {
        cursorElement.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      }
    });
    Aos.init({
      duration: 1500,
      once: true,
    });
    
}

}
