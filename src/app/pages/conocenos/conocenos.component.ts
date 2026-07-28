import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { CarouselModule } from "ngx-owl-carousel-o";
import { CountUpModule } from "ngx-countup";
import { TranslateModule } from "@ngx-translate/core";
import { routes } from "../../shared/routes/routes";

@Component({
  selector: "app-conocenos",
  templateUrl: "./conocenos.component.html",
  styleUrls: ["./conocenos.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, CountUpModule, TranslateModule],
})
export class ConocenosComponent {
  routes = routes;
  testimonial = { items: 1, dots: true, nav: false, loop: true };
}


