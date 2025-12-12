import { Component, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { ClientMenuService } from '../../../shared/data/client-menu.service';

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  public routes = routes;
  activeSection: string = 'profile'; // 'profile' | 'bookings' | 'reviews' | 'wishlist'

  constructor(private clientMenuService: ClientMenuService) {}

  ngOnInit(): void {
    // Suscribirse a cambios de sección desde el menú
    this.clientMenuService.activeSection$.subscribe(section => {
      this.activeSection = section;
    });
  }

  onSectionChange(section: string): void {
    this.activeSection = section;
    this.clientMenuService.setActiveSection(section);
  }
}
