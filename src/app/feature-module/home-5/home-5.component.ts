import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-5',
  standalone: false,
  
  templateUrl: './home-5.component.html',
  styleUrl: './home-5.component.scss'
})
export class Home5Component {
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
public routes=routes;
public cruiseSlider : OwlOptions ={
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
          items: 2,
        },
        576: {
          items: 3,
        },
        992: {
          items: 5,
        },
        1200: {
          items: 6,
        },
      },
}
public clientSlider : OwlOptions ={
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
        items: 5,
      },
      1200: {
        items: 5,
      },
      1400: {
        items: 7,
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
    },
}
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
