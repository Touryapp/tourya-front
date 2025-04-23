import { Component, HostListener } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Router } from '@angular/router';
import { LightGallery } from 'lightgallery/lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BeforeSlideDetail } from 'lightgallery/lg-events';

@Component({
  selector: 'app-tour-details',
  standalone: false,
  
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.scss'
})
export class TourDetailsComponent {
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
    arrows: false,
    fade: true,
    asNavFor: '.slider-nav'
   
  };
  
  // Configuration for the thumbnail slider
  thumbSliderConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    vertical: true,
    asNavFor: '.slider-for',
    dots: false,
    arrows: true,
    focusOnSelect: true,
    verticalSwiping: true,
    prevArrow: "<span class='slick-next'><i class='fa-solid fa-chevron-down'></i></span>",
    nextArrow: "<span class='slick-prev'><i class='fa-solid fa-chevron-up'></i></span>",
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
            slidesToShow: 3,
        },
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
          slidesToShow: 2,
        },
      },
    ],


  };
  
  // Example slides data
  mainSlides = [
    'assets/img/tours/tour-large-01.jpg',
    'assets/img/tours/tour-large-02.jpg',
    'assets/img/tours/tour-large-03.jpg',
    'assets/img/tours/tour-large-04.jpg',
    'assets/img/tours/tour-large-05.jpg',
  ];
  
  thumbSlides = [
    'assets/img/tours/tour-thumb-01.jpg',
    'assets/img/tours/tour-thumb-02.jpg',
    'assets/img/tours/tour-thumb-03.jpg',
    'assets/img/tours/tour-thumb-04.jpg',
    'assets/img/tours/tour-thumb-05.jpg',
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
      src: 'assets/img/tours/tour-large-01.jpg',
    },
    {
      src: 'assets/img/tours/gallery-tour-lg-01.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-02.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-03.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-04.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-05.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-06.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-01.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-02.jpg',
    }
    ,
    {
      src: 'assets/img/tours/gallery-tour-lg-03.jpg',
    }
    ,
    
  ];
  tabs = [
      { id: 'basic_info', label: 'Basic Info' },
      { id: 'specifications', label: 'Specifications' },
      { id: 'additional_service', label: 'Additional Service' },
      { id: 'description', label: 'Description' },
      { id: 'features', label: 'Features' },
      { id: 'location', label: 'Locations' },
      { id: 'faq', label: 'FAQ' },
      { id: 'gallery', label: 'Gallery' },
    ];
  
    activeTab: string = this.tabs[0].id ; // Default to the first tab
  
    @HostListener('window:scroll', [])
    onScroll(): void {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
  
    this.tabs.forEach((tab) => {
        const element = document.getElementById(tab.id);
        if (element) {
          const sectionTop = element.offsetTop - 100; // Adjust offset for fixed headers
          const sectionBottom = sectionTop + element.offsetHeight;
  
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            this.activeTab = tab.id;
          }
        }
      });
    }
  
  
    scrollTo(id: string): void {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.activeTab = id; // Update the active tab
      }
    }
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
  public gallerySlider : OwlOptions ={
      loop: false,
        margin: 8,
        nav: false,
        dots: false,
        autoplay: false,
        responsive: {
          0: {
            items: 2
          },
          550: {
            items: 5
          },
          992: {
            items: 5
          },
          1200: {
            items: 5
          },
          1400: {
            items: 6
          }
        }
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
    this.router.navigateByUrl('/tour/tour-booking'); 
  }
}
