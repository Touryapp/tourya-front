import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { routes } from "../../shared/routes/routes";

@Component({
  selector: "app-contactanos",
  templateUrl: "./contactanos.component.html",
  styleUrls: ["./contactanos.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class ContactanosComponent {
  routes = routes;
}


