import { routes } from './../../../shared/routes/routes';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: false,
  
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
routes = routes
}
