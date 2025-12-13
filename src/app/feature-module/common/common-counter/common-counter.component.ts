import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-common-counter',
  standalone: false,
  templateUrl: './common-counter.component.html',
  styleUrl: './common-counter.component.scss'
})
export class CommonCounterComponent {
  @Input() quantity: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Output() quantityChange = new EventEmitter<number>();

  incrementQuantity(): void {
    if (this.quantity >= this.max) {
      this.quantity = this.max;
    } else {
      this.quantity = Number(this.quantity) + 1;
    }
    this.quantityChange.emit(this.quantity);
  }

  // Decrement the quantity, but not below min
  decrementQuantity(): void {
    if (this.quantity > this.min) {
      this.quantity -= 1;
    }
    this.quantityChange.emit(this.quantity);
  }

  validateQuantity(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    // Check if the input is a valid number
    if (!/^\d*$/.test(inputValue)) {
      this.quantity = this.min; // Reset to min if invalid
    } else {
      const newValue = Number(inputValue);
      if (newValue < this.min) {
        this.quantity = this.min;
      } else if (newValue > this.max) {
        this.quantity = this.max;
      } else {
        this.quantity = newValue;
      }
    }
    this.quantityChange.emit(this.quantity);
  }
}
