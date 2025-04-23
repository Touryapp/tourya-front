import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-pricing-plan',
  standalone: false,
  
  templateUrl: './pricing-plan.component.html',
  styleUrl: './pricing-plan.component.scss'
})
export class PricingPlanComponent {
routes = routes
}
