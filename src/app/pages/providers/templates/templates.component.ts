import { Component } from "@angular/core";
import { routes } from "../../../shared/routes/routes";

@Component({
  selector: "app-templates",
  standalone: false,
  templateUrl: "./templates.component.html",
  styleUrl: "./templates.component.scss"
})
export class TemplatesComponent {
  public routes = routes;
  
  constructor() { }
}
