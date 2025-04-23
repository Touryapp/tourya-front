import { routes } from './../../../../shared/routes/routes';
import { Component } from '@angular/core';

@Component({
  selector: 'app-setting',
  standalone: false,
  
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent {
routes = routes
}
