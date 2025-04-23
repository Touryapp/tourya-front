import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-notification',
  standalone: false,
  
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
public routes =routes
}
