import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import Swal from "sweetalert2";

import { Country } from '../../dto/country.dto';
import { Department } from '../../dto/department.dto';
import { City } from '../../dto/city.dto';
import { CountryService } from '../../services/country.service';
import { DepartmentService } from '../../services/department.service';
import { CityService } from '../../services/city.service';
import { GuestInfoService } from '../../services/guest-info.service';

@Component({
  selector: "app-guest-info-modal",
  standalone: true,
  templateUrl: "./guest-info-modal.component.html",
  styleUrls: ["./guest-info-modal.component.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class GuestInfoModalComponent implements OnInit {
  guestInfoForm: FormGroup;
  loading: boolean = false;
  
  countries: Country[] = [];
  departments: Department[] = [];
  cities: City[] = [];
  selectedFile: File | null = null;
  filePreview: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<GuestInfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private guestInfoService: GuestInfoService
  ) {
    this.guestInfoForm = new FormGroup({
      firstName: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      lastName: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      documentNumber: new FormControl("", [
        Validators.required, 
        Validators.minLength(6)
      ]),
      phone: new FormControl("", [
        Validators.required, 
        Validators.minLength(10)
      ]),
      email: new FormControl("", [
        Validators.required, 
        Validators.email
      ]),
      country: new FormControl("", [Validators.required]),
      department: new FormControl("", [Validators.required]),
      city: new FormControl("", [Validators.required]),
      photo: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.getCountries();
  }

  getCountries() {
    this.countryService.getCountries().subscribe({
      next: (data: any) => {
        if (data) {
          this.countries = data;
        } else {
          this.countries = [];
        }
      },
      error: (err: any) => {
        console.error("Error getting countries.", err);
        this.countries = [];
      },
    });
  }

  onCountryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.departments = [];
    this.cities = [];
    this.guestInfoForm.get('department')?.setValue("");
    this.guestInfoForm.get('city')?.setValue("");
    if(value) {
        this.getDepartments(+value);
    }
  }

  getDepartments(countryId: number) {
    this.departmentService.getDepartmentsByCountryId(countryId).subscribe({
      next: (data: any) => {
        if (data) {
          this.departments = data;
        } else {
          this.departments = [];
        }
      },
      error: (err: any) => {
        console.error("Error getting departments.", err);
        this.departments = [];
      },
    });
  }

  onDepartmentChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.cities = [];
    this.guestInfoForm.get('city')?.setValue("");
    if(value) {
        this.getCities(+value);
    }
  }

  getCities(departmentId: number) {
    this.cityService.getCitiesByDepartmentId(departmentId).subscribe({
      next: (data: any) => {
        if (data) {
          this.cities = data;
        } else {
          this.cities = [];
        }
      },
      error: (err: any) => {
        console.error("Error getting cities.", err);
        this.cities = [];
      },
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.guestInfoForm.patchValue({
        photo: file
      });
      this.guestInfoForm.get('photo')?.updateValueAndValidity();

      // Generar preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.guestInfoForm.invalid) {
      this.guestInfoForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Preparar el payload
    const formData = this.guestInfoForm.value;
    const payload = {
      ...formData,
      photo: this.selectedFile?.name // Solo enviamos el nombre para mockear, o base64 si fuera real
    };

    // Consumir el servicio REST PUT MOCK
    this.guestInfoService.updateGuestInfo(payload).subscribe({
      next: (response) => {
        this.loading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'Información guardada',
          text: 'Tus datos se han guardado exitosamente.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.dialogRef.close(payload); // Cerrar y enviar payload de vuelta por si sirve
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error in PUT request:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al guardar tu información. Por favor, intenta de nuevo.',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }
}
