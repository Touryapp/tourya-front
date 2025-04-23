import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-common-select',
  standalone: false,
  
  templateUrl: './common-select.component.html',
  styleUrl: './common-select.component.scss'
})
export class CommonSelectComponent {
// Input for options to populate the select dropdown
@Input() options: { value: string | number, label: string }[] = [];
  
// Input for the placeholder
@Input() placeholder: string = 'Select an option';

// Input for the selected value
@Input() selectedValue: string | number | null = null;

// Output to emit the selected value
@Output() valueChange = new EventEmitter<string | number>();

// Emit the selected value on change
onValueChange(event: Event): void {
  const selected = (event.target as HTMLSelectElement).value;
  this.valueChange.emit(selected);
}
}
