import { Component, ViewChild } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-car-booking',
  standalone: false,
  
  templateUrl: './car-booking.component.html',
  styleUrl: './car-booking.component.scss'
})
export class CarBookingComponent {
  public routes =routes;
 isPayment=true;
 isPayment1=false;
 isPayment2=false;
 password: boolean[] = [false, false]; 
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
