import { Component } from '@angular/core';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import { routes } from '../../../shared/routes/routes';
import { Router } from '@angular/router';
import { LightGallery } from 'lightgallery/lightgallery';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BeforeSlideDetail } from 'lightgallery/lg-events';

@Component({
  selector: 'app-flight-details',
  standalone: false,
  
  templateUrl: './flight-details.component.html',
  styleUrl: './flight-details.component.scss'
})
export class FlightDetailsComponent {
  public routes=routes;
  isLess =true;
  isMore:boolean[] =[false];
  isChecked2=false;
  isChecked3=false;
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
    margin:10,
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
    margin:10,
    vertical: false,
    asNavFor: '.slider-fors', // Link with the main slider
    dots: false,
    arrows: false,
    focusOnSelect: true,
    prevArrow: "<span class='slick-next'><i class='fa-solid fa-chevron-right'></i></span>",
    nextArrow: "<span class='slick-prev'><i class='fa-solid fa-chevron-left'></i></span>",

  };
  
  // Example slides data
  mainSlides = [
    'assets/img/flight/flight-large-01.jpg',
    'assets/img/flight/flight-large-02.jpg',
    'assets/img/flight/flight-large-03.jpg',
    'assets/img/flight/flight-large-04.jpg',
    'assets/img/flight/flight-large-05.jpg',
    'assets/img/flight/flight-large-06.jpg',
  ];
  
  thumbSlides = [
    'assets/img/flight/flight-thumb-01.jpg',
    'assets/img/flight/flight-thumb-02.jpg',
    'assets/img/flight/flight-thumb-03.jpg',
    'assets/img/flight/flight-thumb-04.jpg',
    'assets/img/flight/flight-thumb-05.jpg',
    'assets/img/flight/flight-thumb-06.jpg',
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
      src: 'assets/img/flight/flight-large-04.jpg',
    },
    {
      src: 'assets/img/flight/flight-large-01.jpg',
    }
    ,
    {
      src: 'assets/img/flight/flight-large-02.jpg',
    }
    ,
    {
      src: 'assets/img/flight/flight-large-03.jpg',
    }
    ,
    {
      src: 'assets/img/flight/flight-large-04.jpg',
    }
    ,
    {
      src: 'assets/img/flight/flight-large-05.jpg',
    }
    ,
    {
      src: 'assets/img/flight/flight-large-01.jpg',
    }
    ,{
      src: 'assets/img/flight/flight-large-04.jpg',
    },
    {
      src: 'assets/img/flight/flight-large-01.jpg',
    }
    ,
    {
      src: 'assets/img/flight/flight-large-02.jpg',
    }
    ,
    {
      src: 'assets/img/flight/flight-large-03.jpg',
    }
    ,
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
  onSubmit1() :void { 
    this.router.navigateByUrl('/flight/flight-booking'); 
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
}
