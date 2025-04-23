import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-team',
  standalone: false,
  
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
routes = routes
}
