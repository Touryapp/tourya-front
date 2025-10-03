import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from '../../shared/routes/routes';

@Component({
  selector: 'app-blogsite',
  standalone: true,
  templateUrl: './blogsite.component.html',
  styleUrl: './blogsite.component.scss',
  imports: [CommonModule, RouterModule]
})
export class BlogsiteComponent {
  routes = routes;
}
