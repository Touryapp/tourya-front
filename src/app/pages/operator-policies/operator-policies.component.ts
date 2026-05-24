import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtmlPipe } from '../../shared/pipe/safe-html.pipe';

@Component({
  selector: 'app-operator-policies',
  standalone: true,
  templateUrl: './operator-policies.component.html',
  styleUrl: './operator-policies.component.scss',
  imports: [CommonModule, RouterModule, TranslateModule, SafeHtmlPipe]
})
export class OperatorPoliciesComponent {
  routes = routes;
}
