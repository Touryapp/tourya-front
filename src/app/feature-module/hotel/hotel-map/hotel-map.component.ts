import { Component, OnInit ,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from '../../../shared/routes/routes';
declare const google: any;

@Component({
  selector: 'app-hotel-map',
  standalone: false,
  templateUrl: './hotel-map.component.html',
  styleUrl: './hotel-map.component.scss'
})
export class HotelMapComponent  {
  public routes=routes;
  private infowindow!: google.maps.InfoWindow;
  private slider!: number;
  private bounds = new google.maps.LatLngBounds();
  private current = 0;
  public isClassAdded: boolean[] = [false];
  public isSelected :boolean[]=[false];
  bsValue =new Date();
  startValue = 500;
  endValue = 3000;
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value) + '';
    }
  
    return `${value}`;
  }
  formatLabel1(value: number): string {
    if (value >= 5000) {
      return '$'+ Math.round(value / 5000) ;
    }
  
    return `$${value}`;
  }
 constructor (private router: Router){}
 map: any;
  locations = [
    {
      id: 1,
      lat: 53.470692,
      lng: -2.220328,
      grid_name: 'Rainbow Mountain Valley',
      grid_address: 'Ciutat Vella, Barcelona',
      grid_day: '4 Day, 3 Night',
      grid_rate: '$500',
      image: 'assets/img/hotels/hotel-01.jpg',
      grid_star: '5.0',
    },
    {
      id: 2,
      lat: 53.469189,
      lng: -2.199262,
      grid_name: 'The Luxe Haven',
      grid_address: 'Oxford Street, London',
      grid_day: '4 Day, 3 Night',
      grid_rate: '$600',
      image: 'assets/img/hotels/hotel-02.jpg',
      grid_star: '5.0',
    },
    {
      id: 3,
      lat: 53.468665,
      lng: -2.189269,
      grid_name: 'The Urban Retreat',
      grid_address: 'Princes Street, Edinburgh',
      grid_day: '4 Day, 3 Night',
      grid_rate: '$700',
      image: 'assets/img/hotels/hotel-06.jpg',
      grid_star: '5.0',
    },
  ];

  ngOnInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    window.clearTimeout(this.slider);
  }

  initializeMap(): void {
    const mapOptions: google.maps.MapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(53.470692, -2.220328),
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
    this.map['slide'] = true;

    this.infowindow = new google.maps.InfoWindow({ content: 'loading...' });
    google.maps.event.addListener(this.infowindow, 'closeclick', () => {
      this.infowindow.close();
    });

    this.setMarkers();
    this.slider = window.setTimeout(() => this.showRandomLocation(), 3000);
  }

  setMarkers(): void {
    this.locations.forEach((location) => {
      const latlng = new google.maps.LatLng(location.lat, location.lng);
      const marker = new google.maps.Marker({
        position: latlng,
        map: this.map,
        animation: google.maps.Animation.DROP,
      });

      this.bounds.extend(marker.getPosition() as google.maps.LatLng);
      google.maps.event.addListener(marker, 'click', () => {
        this.setInfoContent(location);
        this.infowindow.open(this.map, marker);
        window.clearTimeout(this.slider);
      });
    });

    this.map.fitBounds(this.bounds);

    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      if (this.map.getZoom() > 16) this.map['slide'] = false;
    });
  }

  showRandomLocation(): void {
    if (!this.map['slide'] || this.locations.length === 0) return;

    let next: number;
    do {
      next = Math.floor(Math.random() * this.locations.length);
    } while (next === this.current);

    this.current = next;
    const marker = this.locations[next];
    this.setInfoContent(marker);
    this.infowindow.open(this.map, null); // Use a suitable reference for marker if needed
  }

  setInfoContent(marker: any): void {
    const content = `
      <div class="card">
        <div class="card-img">
          <a href="javascript:void(0)" class="property-img">
            <img class="img-fluid w-100" alt="img" src="${marker.image}">
          </a>
        </div>
        <div class="card-body">
          <h5 class="title mb-2">
            <a href="javascript:void(0)" tabindex="-1">${marker.grid_name}</a>
          </h5>
          <p class="mb-3"><i class="isax isax-location"></i> ${marker.grid_address}</p>
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <h4 class="text-primary border-end pe-2 me-2">${marker.grid_rate}</h4>
              <p>${marker.grid_day}</p>
            </div>
            <span class="badge badge-warning text-dark">${marker.grid_star}</span>
          </div>
        </div>
      </div>`;
    this.infowindow.setContent(content);
  }

  public imageSlider : OwlOptions ={
      loop: true,
        margin: 20,
        nav: true,
        dots: true,
        smartSpeed: 2000,
        autoplay: false,
        navText: [
          '<i class="fa-solid fa-chevron-left"></i>',
          '<i class="fa-solid fa-chevron-right"></i>',
        ],
        responsive: {
          0: {
            items: 1,
          },
          550: {
            items: 1,
          },
          768: {
            items: 1,
          },
          1000: {
            items: 1,
          },
        },
    }
  onSubmit1() :void { 
    this.router.navigateByUrl('/hotel/hotel-grid'); 
  }
  toggleClass(index: number){
    this.isClassAdded[index] = !this.isClassAdded[index]
  }
  selectClass(index:number):void{
    this.isSelected[index]=!this.isSelected[index];
   }
}
