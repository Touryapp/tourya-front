import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-flight-list',
  standalone: false,
  
  templateUrl: './flight-list.component.html',
  styleUrl: './flight-list.component.scss'
})
export class FlightListComponent {
public routes=routes;
 bsValue =new Date();
 value!: number;
 isChecked2=false;
 isChecked3=false;
 public isClassAdded: boolean[] = [false];
 public isSelected :boolean[]=[false];
 rangeValues: number[] = [20, 80];
 public isMore : boolean[]=[false];
 startValue = 500;
 endValue = 3000;
 constructor (private router: Router){}
 formatLabel(value: number): string {
  if (value >= 100) {
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
  this.router.navigateByUrl('/flight/flight-grid'); 
}
toggleClass(index: number){
  this.isClassAdded[index] = !this.isClassAdded[index]
}
selectClass(index:number):void{
 this.isSelected[index]=!this.isSelected[index];
}
showMore(index:number) : void {
  this.isMore[index]=!this.isMore[index];
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
