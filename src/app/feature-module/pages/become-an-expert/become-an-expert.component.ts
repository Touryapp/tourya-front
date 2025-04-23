import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { LightGallery } from 'lightgallery/lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';

@Component({
  selector: 'app-become-an-expert',
  standalone: false,
  
  templateUrl: './become-an-expert.component.html',
  styleUrl: './become-an-expert.component.scss'
})
export class BecomeAnExpertComponent {
routes = routes
private lightGallery!: LightGallery;
settings = {
        counter: false,
        plugins: [lgZoom, lgVideo],
      };

    onInit = (detail: { instance: LightGallery }): void => {
      this.lightGallery = detail.instance;
    };
}
