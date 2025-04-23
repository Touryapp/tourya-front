import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-about-us',
  standalone: false,
  
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
routes = routes
public testimonial : OwlOptions={
  loop: false,
    margin: 24,
    nav: true,
    dots: false,
    smartSpeed: 2000,
    autoplay: false,
    navText: [
      "<i class='isax isax-arrow-left-2'></i>",
      "<i class='isax isax-arrow-right-3'></i>",
    ],
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 1,
      },
      769: {
        items: 2,
      },
      993: {
        items: 3,
      },
      1200: {
        items: 3,
      },
      1400: {
        items: 3,
      },
    },
}
}
