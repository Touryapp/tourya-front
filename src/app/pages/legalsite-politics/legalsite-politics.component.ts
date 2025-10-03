import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legalsite-politics',
  standalone: true,
  templateUrl: './legalsite-politics.component.html',
  styleUrl: './legalsite-politics.component.scss',
  imports: [CommonModule, RouterModule]
})
export class LegalsitePoliticsComponent {
  routes = routes;
}
