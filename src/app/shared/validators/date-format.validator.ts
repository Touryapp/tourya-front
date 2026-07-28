import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import dayjs from "dayjs";

export function dayjsDateValidator(format: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const isValid = dayjs(control.value, format, true).isValid(); // Strict parsing

    if (!isValid) {
      return {
        invalidDayjsDate: { requiredFormat: format, actual: control.value },
      };
    }

    return null;
  };
}
