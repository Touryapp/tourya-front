import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { routes } from "../../shared/routes/routes";

@Component({
  selector: "app-contactanos",
  templateUrl: "./contactanos.component.html",
  styleUrls: ["./contactanos.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
})
export class ContactanosComponent {
  routes = routes;
}


