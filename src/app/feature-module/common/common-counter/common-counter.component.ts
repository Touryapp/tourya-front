import { Component } from '@angular/core';

@Component({
  selector: 'app-common-counter',
  standalone: false,
  templateUrl: './common-counter.component.html',
  styleUrl: './common-counter.component.scss'
})
export class CommonCounterComponent {
  quantity: number = 1;
  incrementQuantity(): void {
    if (this.quantity>=100){
      this.quantity=100;
    }
    else{
    this.quantity = Number(this.quantity) + 1;
    }
  }

  // Decrement the quantity, but not below 0
  decrementQuantity(): void {
    if (this.quantity > 0) {
      this.quantity -= 1;
    }
  }
  validateQuantity(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    // Check if the input is a valid number
    if (!/^\d*$/.test(inputValue)) {
      this.quantity = 0; // Reset to 0 if invalid
    } else {
      this.quantity = Number(inputValue); // Convert valid input to a number
    }
  }
}
