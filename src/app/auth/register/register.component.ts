import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../shared/routes/routes';

@Component({
  selector: 'app-register',
  standalone: false,
  
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  public routes = routes
  password: boolean[] = [false, false]; // Add more as needed

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  constructor(
    private router: Router,
    private renderer:Renderer2
  ){}
  navigation(){
    this.router.navigate([routes.index])
  }
  ngOnInit(): void {
    this.renderer.addClass(document.body, 'bg-light-200');
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'bg-light-200');
  }
}
