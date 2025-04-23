import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeWords',
  standalone: false
})
export class CapitalizeWordsPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }
    return value
      .split('-') // Split the string by hyphens
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' '); // Join the words with spaces
  }

}
