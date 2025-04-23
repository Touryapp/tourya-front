import { Component, ViewChild } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-tour-booking',
  standalone: false,
  
  templateUrl: './tour-booking.component.html',
  styleUrl: './tour-booking.component.scss'
})
export class TourBookingComponent {
public routes =routes;
  password: boolean[] = [false, false]; 
 isPayment=true;
 isPayment1=false;
 isPayment2=false;
 togglePassword(index: number): void {
  this.password[index] = !this.password[index];
}
 onPayment() : void{
  this.isPayment1=false;
  this.isPayment=true;
  this.isPayment2=false;
 }
 onPayment1() : void{
  this.isPayment=false;
  this.isPayment1=true;
  this.isPayment2=false;
 }
 onPayment2() : void{
  this.isPayment2=true;
  this.isPayment=false;
  this.isPayment1=false;
 }
 @ViewChild('fileInput') fileInput: any;

  openFileExplorer(): void {
    this.fileInput.nativeElement.click();
  }
}
