import { Component } from '@angular/core';
import { LightGallery } from 'lightgallery/lightgallery';
import { OwlOptions } from 'ngx-owl-carousel-o';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import { Router } from '@angular/router';
import { routes } from '../../shared/routes/routes';


@Component({
  selector: 'app-home-2',
  standalone: false,
  
  templateUrl: './home-2.component.html',
  styleUrl: './home-2.component.scss'
})
export class Home2Component {
  public routes=routes
  time: Date | null = null; // Bind this to the p-calendar
  constructor(private router: Router) {
  }
  bsValue=new Date();
  isChecked=false;
  isChecked2=false;
  isChecked3=false;
  isChecked4=false;
  isChecked5=false;
  isChecked6=false;
  toreset=true;
  public isClassAdded: boolean[] = [false];
  public isSelected :boolean[]=[false];
  navContainer?: string;
 
// Configuration for the main slider
mainSliderConfig = {
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  fade: true,
  asNavFor: '.slider-nav', // Link with the thumbnail slider
};

// Configuration for the thumbnail slider
thumbSliderConfig = {
  slidesToShow: 3,
  slidesToScroll: 1,
  vertical: true,
  asNavFor: '.slider-fors', // Link with the main slider
  dots: false,
  arrows: false,
  focusOnSelect: true,
  verticalSwiping: true,
  responsive: [
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 768,
    },
    {
      breakpoint: 580,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 0,
      settings: {
        vertical: false,
        slidesToShow: 1,
      },
    },
  ],
};

// Example slides data
mainSlides = [
  'assets/img/hotels/hotel-slider-01.jpg',
  'assets/img/hotels/hotel-slider-02.jpg',
  'assets/img/hotels/hotel-slider-03.jpg',
  'assets/img/hotels/hotel-slider-04.jpg',
];

thumbSlides = [
  'assets/img/hotels/hotel-slider-thumb-01.jpg',
  'assets/img/hotels/hotel-slider-thumb-02.jpg',
  'assets/img/hotels/hotel-slider-thumb-03.jpg',
  'assets/img/hotels/hotel-slider-thumb-04.jpg',
];
public travelerSlider : OwlOptions={
  loop: true,
      margin: 24,
      nav: true,
      dots: false,
      autoplay: false,
      smartSpeed: 2000,
      navText: [
        "<i class='fa-solid fa-chevron-left'></i>",
        "<i class='fa-solid fa-chevron-right'></i>",
      ],
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 2,
        },
        992: {
          items: 3,
        },
        1200: {
          items: 5,
        },
        1400: {
          items: 5,
        },
      },
}

public placeSlider:OwlOptions ={
  loop: false,
    margin: 24,
    nav: true,
    dots: false,
    smartSpeed: 2000,
    autoplay: false,
    navText: [
      "<i class='isax isax-arrow-left-2'></i>",
      "<i class='isax isax-arrow-right-3'></i>",
    ],
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
      1200: {
        items: 4,
      },
      1400: {
        items: 4,
      },
    },
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
      1200: {
        items: 1,
      },
    },
}
public clientSlider: OwlOptions={
  loop: true,
  margin: 24,
  nav: false,
  dots: false,
  autoplay: true,
  smartSpeed: 2000,
  navText: [
    "<i class='fa-solid fa-chevron-left'></i>",
    "<i class='fa-solid fa-chevron-right'></i>",
  ],
  responsive: {
    0: {
      items: 2,
    },
    576: {
      items: 3,
    },
    992: {
      items: 4,
    },
    1200: {
      items: 5,
    },
    1400: {
      items: 6,
    },
  },
}

public offerSlider :OwlOptions={
  loop: true,
  margin: 24,
  nav: true,
  dots: false,
  autoplay: false,
  smartSpeed: 2000,
  navText: [
    "<i class='fa-solid fa-chevron-left'></i>",
    "<i class='fa-solid fa-chevron-right'></i>",
  ],
  responsive: {
    0: {
      items: 1,
    },
    576: {
      items: 1,
    },
    1400: {
      items: 1,
    },
  },
}

public hotelSlider:OwlOptions ={
  loop: true,
      margin: 24,
      nav: false,
      dots: false,
      autoplay: false,
      smartSpeed: 2000,
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 1,
        },
        991: {
          items: 3,
        },
        1200: {
          items: 3,
        },
        1400: {
          items: 4,
        },
      },
}
public testimonialSlider:OwlOptions={
  loop: true,
      margin: 24,
      nav: true,
      dots: false,
      autoplay: false,
      smartSpeed: 2000,
      navText: [
        "<i class='isax isax-arrow-left-2'></i>",
        "<i class='isax isax-arrow-right-3'></i>",
      ],
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 3,
        },
        1200: {
          items: 4,
        },
      },
}
public blogSlider : OwlOptions={
  loop: true,
      margin: 24,
      nav: true,
      dots: false,
      autoplay: false,
      smartSpeed: 2000,
      navText: [
        "<i class='fa-solid fa-chevron-left'></i>",
        "<i class='fa-solid fa-chevron-right'></i>",
      ],
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 2,
        },
        992: {
          items: 3,
        },
        1200: {
          items: 3,
        },
      },
}
  settings = {
    counter: false,
    plugins: [lgZoom, lgVideo],
  };
  private lightGallery!: LightGallery;
  private needRefresh = false;
  ngAfterViewChecked(): void {
    if (this.needRefresh) {
      this.lightGallery.refresh();
      this.needRefresh = false;
    }
  }
  onInit = (detail: { instance: LightGallery }): void => {
    this.lightGallery = detail.instance;
  };
  onSubmit() :void { 
    this.router.navigateByUrl('/hotel/hotel-grid'); 
  }
  onSubmit2() :void { 
   this.router.navigateByUrl('/flight/flight-grid'); 
  }
  onSubmit3() :void { 
  this.router.navigateByUrl('/car/car-grid'); 
  }
  onSubmit4() :void { 
  this.router.navigateByUrl('/cruise/cruise-grid'); 
  }
  onSubmit5() :void { 
  this.router.navigateByUrl('/tour/tour-grid'); 
  } 
  onCheck() :void{
    this.isChecked2=false;
    this.isChecked3=false;
  }
  onCheck2() :void{
    this.isChecked2=true;
    this.isChecked3=false;
  }
  onCheck3() :void{
    this.isChecked3=true;
    this.isChecked2=false;
  }
  onCheck4() :void{
    this.isChecked4=true;
    this.isChecked5=false;
    this.isChecked6=false;
  }
  onCheck5() :void{
    this.isChecked5=true;
    this.isChecked6=false;
    this.isChecked4=false ;
    this.toreset=false;
  }
  onCheck6() :void{
    this.isChecked4=false;
    this.isChecked6=true;
    this.isChecked5=false;
    this.toreset=false;
  }
  reset() :void{
    this.isChecked4=false;                                         
    this.isChecked5=false;
    this.isChecked6=false;
    this.toreset=true;
  }
  ngOnInit(): void {
    // Set the default time to 10:30 AM
    const defaultTime = new Date();
    defaultTime.setHours(10, 30, 0, 0); // Set hours, minutes, seconds, milliseconds
    this.time = defaultTime;
  }
  toggleClass(index: number){
    this.isClassAdded[index] = !this.isClassAdded[index]
  }
  selectClass(index:number):void{
   this.isSelected[index]=!this.isSelected[index];
  }
}
