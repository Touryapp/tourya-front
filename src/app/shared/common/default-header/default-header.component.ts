import { Component, HostListener, inject } from "@angular/core";
import { MainMenu, Menu, SideBar } from "../../../shared/models/models";


import { CommonService } from "../../../shared/common/common.service";
import { NavigationEnd, Router } from "@angular/router";
import { SideBarService } from "../../../shared/side-bar/side-bar.service";
import { routes } from "../../../shared/routes/routes";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { SettingService } from "../../../shared/settings/settings.service";
import { AuthService } from "../../../core/services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { Roles } from "../../enums/roles.enum";
import { RequestsProvidersStatus } from "../../enums/requests-providers-status.enum";
import { DataService } from "../../../shared/data/data.service";

@Component({
  selector: "app-default-header",
  templateUrl: "./default-header.component.html",
  styleUrl: "./default-header.component.scss",
  standalone: false,
})
export class DefaultHeaderComponent {
  authService = inject(AuthService);
  header: Array<SideBar> = [];
  base = "dashboard";
  public page = "";
  last = "";
  isMobileMenu = false;
  isDropdownOpen = false;
  isDropdownOpen1 = false;
  isHovered = false;
  ishome2 = false;
  isheaderFour = false;
  show = false;
  isFixed = false;
  isdark = true;
  islight = false;
  themeColor = "2";
  public routes = routes;
  side_bar_data: MainMenu[] = [];
  password: boolean[] = [false, false]; // Add more as needed

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  @HostListener("window:scroll", [])
  onWindowScroll() {
    // Add a fixed class when the scroll position is greater than 50px
    this.isFixed = window.pageYOffset > 50;
  }
  mainMenus = [
    { title: "Menu 1", separateRoute: false },
    { title: "Menu 2", separateRoute: false },
    { title: "Menu 3", separateRoute: false },
  ];
  openDropdownIndex: number | null = null;

  selectedLanguage: string = "en";
  languages: string[] = ["en"];

  constructor(
    private data: DataService,
    private sideBar: SideBarService,
    private common: CommonService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public settings: SettingService,
    private translate: TranslateService
  ) {
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.page.subscribe((res: string) => {
      this.last = res;
    });
    this.header = this.data.sideBar;
    this.settings.themeColor.subscribe((res: string) => {
      this.themeColor = res;
    });

    // Obtener el idioma actual (ya fue detectado en app.component.ts)
    // No forzar "en" como default para respetar la detección automática
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang();
    this.selectedLanguage = currentLang;
    this.languages = this.translate.getLangs();
  }

  elem = document.documentElement;
  fullscreen() {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  public togglesMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  public expandSubMenus(menu: Menu): void {
    sessionStorage.setItem("menuValue", menu.menuValue);
    this.side_bar_data.map((mainMenus: MainMenu) => {
      mainMenus.menu.map((resMenu: Menu) => {
        // collapse other submenus which are open
        if (resMenu.menuValue === menu.menuValue) {
          menu.showSubRoute = !menu.showSubRoute;
          if (menu.showSubRoute === false) {
            sessionStorage.removeItem("menuValue");
          }
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }

  miniSideBarBlur(position: string) {
    if (position === "over") {
      this.sideBar.expandSideBar.next(true);
    } else {
      this.sideBar.expandSideBar.next(false);
    }
  }

  miniSideBarFocus(position: string) {
    if (position === "over") {
      this.sideBar.expandSideBar.next(true);
    } else {
      this.sideBar.expandSideBar.next(false);
    }
  }
  public submenus = false;
  openSubmenus() {
    this.submenus = !this.submenus;
  }
  ngOnInit(): void {
    this.breakpointObserver
      .observe(["(max-width: 991px)"])
      .subscribe((result) => {
        this.isMobileMenu = result.matches;
      });
    const themeColor = localStorage.getItem("themeColor") || "2";
    this.settings.changeThemeColor(themeColor);
  }
  closeMenu(): void {
    this.isMobileMenu = false; // Removes the `mean-container` class
    this.show = false;
  }
  addmenu(): void {
    this.isMobileMenu = true;
    this.show = true;
  }
  openSubMenu(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.openDropdownIndex = null;
  }
  toggleSubMenu(index: number): void {
    // If the clicked menu is already open, close it
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
    this.isDropdownOpen = false;
  }
  darkMode(): void {
    this.isdark = !this.isdark;
    this.islight = !this.islight;
  }
  onSubmit0(): void {
    this.router.navigateByUrl("/index");
  }

  useLanguage(language: string): void {
    const langs = this.translate.getLangs();
    if (langs.includes(language)) {
      this.selectedLanguage = language;
      this.translate.use(language);
      localStorage.setItem("lang", language);
    }
  }

  getLanguageImg(language: string): string {
    switch (language.toLowerCase()) {
      case "en": {
        return "assets/img/flags/us-flag.svg";
      }
      case "es": {
        return "assets/img/flags/es.png";
      }
      case "pt": {
        return "assets/img/flags/br.png";
      }
      default: {
        return "assets/img/flags/us-flag.svg";
      }
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  get isProvider(): boolean {
    return this.authService.isProvider();
  }
  get isUser(): boolean {
    return this.authService.isUser();
  }

  redirectByRole() {
    const requestProviderStatus = this.authService.getRequestProviderStatus();
    if (this.isUser && requestProviderStatus !== RequestsProvidersStatus.APPROVED) {
      this.router.navigate(["/providers/requestproviders"]);
    } else if (this.isProvider && requestProviderStatus === RequestsProvidersStatus.APPROVED) {
      this.router.navigate(["providers"]);
    }
  }
}
