import { Component } from "@angular/core";
import { Router, Event as RouterEvent, NavigationStart } from "@angular/router";
import { CommonService } from "./shared/common/common.service";
import { url } from "./shared/models/models";
import { setTheme } from "ngx-bootstrap/utils";
import { TranslateService } from "@ngx-translate/core";
import { GeolocationService } from "./core/services/geolocation.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: false,
})
export class AppComponent {
  title = "SmartHR";
  base = "";
  page = "";
  last = "";
  constructor(
    private common: CommonService,
    private router: Router,
    private translate: TranslateService,
    private geoService: GeolocationService
  ) {
    setTheme("bs5");
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    this.router.events.subscribe((data: RouterEvent) => {
      if (data instanceof NavigationStart) {
        this.getRoutes(data);
      }
    });

    // Configurar idiomas disponibles
    this.translate.addLangs(["en", "es", "pt"]);
    this.translate.setDefaultLang("en");

    // Detectar y establecer idioma
    this.detectAndSetLanguage();
  }

  /**
   * Detecta el idioma basado en el país del navegador
   * Prioridad: 1. localStorage, 2. País del navegador, 3. Idioma del navegador, 4. Fallback 'en'
   */
  private detectAndSetLanguage(): void {
    // 1. Verificar si ya hay un idioma guardado por el usuario
    const savedLang = localStorage.getItem("lang");
    
    if (savedLang) {
      this.translate.use(savedLang);
      return;
    }

    // 2. Detectar país desde el navegador
    const countryCode = this.geoService.getCountryFromBrowser();
    const detectedLang = this.geoService.mapCountryToLanguage(countryCode);
    
    // 3. Usar el idioma detectado o el del navegador como fallback
    const languageToUse = detectedLang || this.translate.getBrowserLang() || "en";
    
    this.translate.use(languageToUse);
    
    console.log(`País detectado: ${countryCode}, Idioma: ${languageToUse}`);
  }

  public getRoutes(events: url) {
    const splitVal = events.url.split("/");
    this.common.base.next(splitVal[1]);
    this.common.page.next(splitVal[2]);
    this.common.last.next(splitVal[3]);
  }
}
