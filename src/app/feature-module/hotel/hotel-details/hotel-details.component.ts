import { Component } from '@angular/core';
import { listingDetails } from '../../../shared/models/models';
import { Router } from '@angular/router';
import { LightGallery } from 'lightgallery/lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import { routes } from '../../../shared/routes/routes';

interface data {
  value: string ;
}
@Component({
  selector: 'app-hotel-details',
  standalone: false,
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.scss'
})
export class HotelDetailsComponent {
  public routes=routes;
  isLess =true;
  isMore:boolean[] =[false];
  time: Date | null = null; // Bind this to the p-calendar
    constructor(private router: Router) {
    }
    bsValue=new Date();
    public isClassAdded: boolean[] = [false];
    toreset=true;
    navContainer?: string;
   
  // Configuration for the main slider
  mainSliderConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    asNavFor: '.slider-nav', // Link with the thumbnail slider
    prevArrow: "<span class='slick-next'><i class='fa-solid fa-chevron-right'></i></span>",
    nextArrow: "<span class='slick-prev'><i class='fa-solid fa-chevron-left'></i></span>",
  };
  
  // Configuration for the thumbnail slider
  thumbSliderConfig = {
    slidesToShow: 5,
    slidesToScroll: 1,
    vertical: false,
    asNavFor: '.slider-fors', // Link with the main slider
    dots: false,
    arrows: true,
    focusOnSelect: true,
    prevArrow: "<span class='slick-next'><i class='fa-solid fa-chevron-right'></i></span>",
    nextArrow: "<span class='slick-prev'><i class='fa-solid fa-chevron-left'></i></span>",

  };
  
  // Example slides data
  mainSlides = [
    'assets/img/hotels/hotel-large-01.jpg',
    'assets/img/hotels/hotel-large-02.jpg',
    'assets/img/hotels/hotel-large-03.jpg',
    'assets/img/hotels/hotel-large-04.jpg',
    'assets/img/hotels/hotel-large-05.jpg',
    'assets/img/hotels/hotel-large-06.jpg',
  ];
  
  thumbSlides = [
    'assets/img/hotels/hotel-thumb-01.jpg',
    'assets/img/hotels/hotel-thumb-02.jpg',
    'assets/img/hotels/hotel-thumb-03.jpg',
    'assets/img/hotels/hotel-thumb-04.jpg',
    'assets/img/hotels/hotel-thumb-05.jpg',
    'assets/img/hotels/hotel-thumb-06.jpg',
  ];

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
      images = [
    {
      src: 'assets/img/hotels/hotel-large-02.jpg',
    },
    {
      src: 'assets/img/hotels/hotel-large-07.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-08.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-09.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-10.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-11.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-12.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-13.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-15.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-16.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-10.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-10.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-10.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-10.jpg',
    }
    ,
    {
      src: 'assets/img/hotels/hotel-large-10.jpg',
    }
  ];
  gallerySettings = {
    counter: true,
    download: true
  };
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
  public roomSlider : OwlOptions={
    loop: true,
      margin: 0,
      nav: true,
      dots: false,
      autoWidth:true,
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
  toggleClass(index: number){
    this.isClassAdded[index] = !this.isClassAdded[index]
  }
  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { index, prevIndex } = detail;
  };
  showMore() : void{
    this.isLess=!this.isLess;
  }
  showLess(index:number) : void{
    this.isMore[index]=!this.isMore[index];
  }
  onSubmit() :void { 
    this.router.navigateByUrl('/hotel/hotel-details'); 
  }
  onSubmit1() :void { 
    this.router.navigateByUrl('/hotel/hotel-booking'); 
  }
}                                                                                                                                                 
