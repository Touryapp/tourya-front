import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    styleUrl: './date-range-picker.component.scss',
    standalone: false
})
export class DateRangePickerComponent {
  bsValue = new Date();
  bsRangeValue: Date[];

  @Output() dateRangeChange = new EventEmitter<{fromDate: string, toDate: string} | null>();

  constructor() {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);
    fromDate.setDate(1);
    
    const toDate = new Date();

    this.bsRangeValue = [fromDate, toDate];
    
    // Emitir el valor inicial para que los componentes padres apliquen el filtro por defecto
    setTimeout(() => {
      this.onValueChange(this.bsRangeValue);
    });
  }

  onValueChange(value: any) {
    if (value && Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
      // YYYY-MM-DD format
      const fromDate = this.formatDate(value[0]);
      const toDate = this.formatDate(value[1]);
      this.dateRangeChange.emit({ fromDate, toDate });
    } else {
      this.dateRangeChange.emit(null);
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
