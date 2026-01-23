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
import { ProviderPanelStateService, ProviderPanelView } from "../../../shared/services/provider-panel-state.service";

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
  isLegalOpen = false;
  isProfileOpen = false;
  isProfileToursOpen = false;

  toggleLegal() {
    this.isLegalOpen = !this.isLegalOpen;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  toggleProfileTours() {
    this.isProfileToursOpen = !this.isProfileToursOpen;
    // Keep parent open
    this.isProfileOpen = true;
  }


  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  @HostListener("window:scroll", [])
  onWindowScroll() {
    // Don't change header state when hamburger menu is open to prevent menu reset
    if (this.show) {
      return;
    }
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
    private translate: TranslateService,
    private panelStateService: ProviderPanelStateService
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
    // Re-enable body scroll
    document.body.style.overflow = '';
  }
  addmenu(): void {
    this.isMobileMenu = true;
    this.show = true;
    // Disable body scroll to prevent menu reset on scroll
    document.body.style.overflow = 'hidden';
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
    // Proveedores no pueden cambiar el idioma
    if (!this.canChangeLanguage) {
      console.warn('Los proveedores no pueden cambiar el idioma');
      return;
    }

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

  /**
   * Determina si el usuario puede cambiar el idioma
   * Solo los proveedores (que no sean admin) NO pueden cambiar el idioma
   */
  get canChangeLanguage(): boolean {
    // Si es proveedor y NO es admin, no puede cambiar idioma
    if (this.isProvider && !this.isAdmin) {
      return false;
    }
    // Todos los demás (no autenticados, clientes, admins) pueden cambiar idioma
    return true;
  }

  /**
   * Get the user's display name (first name + first surname)
   */
  get userDisplayName(): string {
    return this.authService.getUserDisplayName();
  }

  redirectByRole() {
    const requestProviderStatus = this.authService.getRequestProviderStatus();
    if (this.isUser && requestProviderStatus !== RequestsProvidersStatus.APPROVED) {
      this.router.navigate(["/providers/requestproviders"]);
    } else if (this.isProvider && requestProviderStatus === RequestsProvidersStatus.APPROVED) {
      this.router.navigate(["providers"]);
    }
  }

  /**
   * Navega al panel de proveedor y cambia la vista usando el servicio compartido
   */
  navigateToProviderPanel(view: ProviderPanelView): void {
    console.log('🔄 Navegando a provider panel con vista:', view);
    
    // Primero navegar a la ruta del provider panel
    this.router.navigate(['/providers/provider-panel']).then(() => {
      // Luego cambiar la vista usando el servicio
      this.panelStateService.setView(view);
      
      // Cerrar el menú hamburguesa
      this.closeMenu();
    });
  }

  /**
   * Navega a la sección de perfil correcta basándose en el rol del usuario
   * - Si es Cliente: navega a /clients/my-profile con query param de sección
   * - Si es Proveedor: navega a /providers/provider-panel con la vista correspondiente
   */
  navigateToProfileSection(section: 'profile' | 'bookings' | 'reviews' | 'payments' | 'tours' | 'templates'): void {
    console.log('🔄 Navegando a sección de perfil:', section, 'Rol:', this.isProvider ? 'Provider' : 'Client');
    
    // Si el usuario es proveedor (y no solo cliente), usar la navegación de proveedor
    if (this.isProvider && !this.isAdmin) {
      // Mapear las secciones a las vistas del provider panel
      const viewMap: { [key: string]: ProviderPanelView } = {
        'tours': 'tours',
        'templates': 'templates',
        'bookings': 'reservas',
        'reviews': 'reviews',
        'payments': 'pagos'
      };
      
      const view = viewMap[section];
      if (view) {
        this.navigateToProviderPanel(view);
      }
    } else {
      // Si es cliente, navegar a la ruta de cliente con query param de sección
      const sectionMap: { [key: string]: string } = {
        'profile': 'profile',
        'bookings': 'bookings',
        'reviews': 'reviews',
        'payments': 'payments'
      };
      
      const clientSection = sectionMap[section] || 'profile';
      
      this.router.navigate(['/clients/my-profile'], {
        queryParams: { section: clientSection }
      }).then(() => {
        // Cerrar el menú hamburguesa
        this.closeMenu();
      });
    }
  }

  /**
   * Navega a la página de login pasando la URL actual como returnUrl
   */
  navigateToLogin(): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: currentUrl }
    });
  }
}
