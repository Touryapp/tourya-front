import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function onlyNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Don't validate empty values here, add a separate 'required' validator if needed
    }
    const isNumber = /^[0-9]*$/.test(control.value);
    return isNumber ? null : { onlyNumber: true };
  };
}
