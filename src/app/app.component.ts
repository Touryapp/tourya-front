import { Component } from "@angular/core";
import { Router, Event as RouterEvent, NavigationStart } from "@angular/router";
import { CommonService } from "./shared/common/common.service";
import { url } from "./shared/models/models";
import { setTheme } from "ngx-bootstrap/utils";
import { TranslateService } from "@ngx-translate/core";

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
    private translate: TranslateService
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

    this.translate.addLangs(["en", "es", "pt"]);
    this.translate.setDefaultLang("en");

    this.translate.use(
      localStorage.getItem("lang") || this.translate.getBrowserLang() || "en"
    );
  }
  public getRoutes(events: url) {
    const splitVal = events.url.split("/");
    this.common.base.next(splitVal[1]);
    this.common.page.next(splitVal[2]);
    this.common.last.next(splitVal[3]);
  }
}
