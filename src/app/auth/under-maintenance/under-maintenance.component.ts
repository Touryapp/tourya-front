import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-under-maintenance',
  standalone: false,
  
  templateUrl: './under-maintenance.component.html',
  styleUrl: './under-maintenance.component.scss'
})
export class UnderMaintenanceComponent {
constructor(
  private renderer:Renderer2
){}
ngOnInit(): void {
 this.renderer.addClass(document.body, 'bg-primary-transparent');
}
ngOnDestroy(): void {
 this.renderer.removeClass(document.body, 'bg-primary-transparent');
}
}
