import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtmlPipe } from '../../shared/pipe/safe-html.pipe';

@Component({
  selector: 'app-legal-site',
  standalone: true,
  templateUrl: './legal-site.component.html',
  styleUrl: './legal-site.component.scss',
  imports: [CommonModule, RouterModule, TranslateModule, SafeHtmlPipe]
})
export class LegalSiteComponent {
routes = routes;
}
