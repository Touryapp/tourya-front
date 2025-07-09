import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { routes } from "../../../shared/routes/routes";

@Component({
  selector: 'app-tours-detail',
  standalone: false,
  templateUrl: './tours-detail.component.html',
  styleUrl: './tours-detail.component.scss'
})
export class ToursDetailComponent implements OnInit {
  public routes = routes;
  
  // Date picker
  bsValue = new Date();
  
  // Show more/less functionality
  isMore: boolean[] = [false, false, false, false, false, false, false, false];
  
  // Main slider configuration
  mainSliderConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    asNavFor: '.slider-nav'
  };

  // Thumbnail slider configuration
  thumbSliderConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: '.slider-for',
    dots: false,
    centerMode: true,
    focusOnSelect: true,
    arrows: false
  };

  // Gallery settings
  gallerySettings = {
    counter: false,
    plugins: []
  };

  // Lightbox settings
  settings = {
    counter: false,
    plugins: []
  };

  // Main slides data
  mainSlides = [
    'assets/img/tours/tours-07.jpg',
    'assets/img/tours/tours-08.jpg',
    'assets/img/tours/tours-09.jpg',
    'assets/img/tours/tours-10.jpg',
    'assets/img/tours/tours-11.jpg'
  ];

  // Thumbnail slides data
  thumbSlides = [
    'assets/img/tours/tours-07.jpg',
    'assets/img/tours/tours-08.jpg',
    'assets/img/tours/tours-09.jpg',
    'assets/img/tours/tours-10.jpg',
    'assets/img/tours/tours-11.jpg'
  ];

  // Gallery images
  images = [
    { src: 'assets/img/tours/gallery-tour-lg-01.jpg' },
    { src: 'assets/img/tours/gallery-tour-lg-02.jpg' },
    { src: 'assets/img/tours/gallery-tour-lg-03.jpg' },
    { src: 'assets/img/tours/gallery-tour-lg-04.jpg' },
    { src: 'assets/img/tours/gallery-tour-lg-05.jpg' },
    { src: 'assets/img/tours/gallery-tour-lg-06.jpg' }
  ];

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  showLess(index: number): void {
    this.isMore[index] = !this.isMore[index];
  }

  onSubmit1(): void {
    // Handle form submission
    console.log('Form submitted');
  }

  onBeforeSlide(): void {
    // Handle before slide event
  }
} 