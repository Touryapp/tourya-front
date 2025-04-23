import { Component } from '@angular/core';
import { routes } from '../../../../shared/routes/routes';

@Component({
  selector: 'app-plans-billings',
  standalone: false,
  
  templateUrl: './plans-billings.component.html',
  styleUrl: './plans-billings.component.scss'
})
export class PlansBillingsComponent {
routes = routes
}
