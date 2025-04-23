import { Component } from '@angular/core';
import { routes } from '../../../../shared/routes/routes';

@Component({
  selector: 'app-integration-settings',
  standalone: false,
  
  templateUrl: './integration-settings.component.html',
  styleUrl: './integration-settings.component.scss'
})
export class IntegrationSettingsComponent {
routes=routes
}
