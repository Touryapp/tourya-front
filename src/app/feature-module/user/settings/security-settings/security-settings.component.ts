import { Component } from '@angular/core';
import { routes } from '../../../../shared/routes/routes';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-security-settings',
  standalone: false,
  
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss'
})
export class SecuritySettingsComponent {
routes=routes;
password: boolean[] = [false, false]; // Add more as needed

togglePassword(index: number): void {
  this.password[index] = !this.password[index];
}
ngAfterViewInit(): void {
  const input = document.querySelector('#phone') as HTMLInputElement;
  const input2 = document.querySelector('#phone2') as HTMLInputElement;
  intlTelInput(input, {
    initialCountry: 'us',
    preferredCountries: ['us', 'gb', 'in'],
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
  }as any);
  intlTelInput(input2, {
    initialCountry: 'us',
    preferredCountries: ['us', 'gb', 'in'],
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
  }as any);
      // Restrict input to numbers, "+", and allowed characters
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9+()-\s]/g, ''); // Removes any character not allowed
      });
      input2.addEventListener('input', () => {
        input2.value = input2.value.replace(/[^0-9+()-\s]/g, ''); // Removes any character not allowed
      });
}
}
