import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function passwordMatchValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (controls: AbstractControl): ValidationErrors | null => {
    const control = controls.get(controlName);
    const matchingControl = controls.get(matchingControlName);

    if (control === null || matchingControl === null) {
      return null;
    }

    return control.value === matchingControl.value
      ? null
      : { passwordMismatch: true };
  };
}
