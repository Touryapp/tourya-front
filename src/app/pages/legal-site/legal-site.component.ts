import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-site',
  standalone: true,
  templateUrl: './legal-site.component.html',
  styleUrl: './legal-site.component.scss',
  imports: [CommonModule, RouterModule]
})
export class LegalSiteComponent {
routes = routes;
}
