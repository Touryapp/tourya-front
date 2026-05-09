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
import { TouristService } from "../../services/tourist.service";
import { TouristProfileDto } from "../../dto/tourist-profile.dto";



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
  isPhotoDisabled: boolean = false;
  profileData: TouristProfileDto | null = null;



  constructor(
    public dialogRef: MatDialogRef<GuestInfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private guestInfoService: GuestInfoService,
    private touristService: TouristService
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
    this.loadProfile();
  }

  loadProfile() {
    this.touristService.getProfile().subscribe({
      next: (profile: TouristProfileDto) => {
        this.profileData = profile;
        if (!profile) return;

        const simpleFields: (keyof TouristProfileDto)[] = ['firstName', 'lastName', 'documentNumber', 'phone', 'email'];
        simpleFields.forEach(field => {
          if (profile[field]) {
            this.guestInfoForm.get(field as string)?.patchValue(profile[field]);
            this.guestInfoForm.get(field as string)?.disable();
          }
        });

        if (profile.photoUrl) {
          this.filePreview = profile.photoUrl;
          this.guestInfoForm.get('photo')?.patchValue(profile.photoUrl);
          this.guestInfoForm.get('photo')?.disable();
          this.isPhotoDisabled = true;
        }
      },
      error: (err) => {
        console.error('Error loading profile', err);
      }
    });
  }



  getCountries() {
    this.countryService.getCountries().subscribe({
      next: (data: any) => {
        this.countries = data || [];
        
        if (this.profileData?.country && this.countries.length > 0) {
          const matchedCountry = this.countries.find(c => 
            c.name.toLowerCase() === this.profileData?.country?.toLowerCase()
          );
          if (matchedCountry) {
            this.guestInfoForm.get('country')?.patchValue(matchedCountry.id);
            this.guestInfoForm.get('country')?.disable();
            this.getDepartments(matchedCountry.id);
          }
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
        this.departments = data || [];

        if (this.profileData?.state && this.departments.length > 0) {
          const matchedDept = this.departments.find(d => 
            d.name.toLowerCase() === this.profileData?.state?.toLowerCase()
          );
          if (matchedDept) {
            this.guestInfoForm.get('department')?.patchValue(matchedDept.id);
            this.guestInfoForm.get('department')?.disable();
            this.getCities(matchedDept.id);
          }
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
        this.cities = data || [];

        if (this.profileData?.city && this.cities.length > 0) {
          const matchedCity = this.cities.find(c => 
            c.name.toLowerCase() === this.profileData?.city?.toLowerCase()
          );
          if (matchedCity) {
            this.guestInfoForm.get('city')?.patchValue(matchedCity.id);
            this.guestInfoForm.get('city')?.disable();
          }
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
    console.log('🚀 Iniciando submitForm en GuestInfoModalComponent');
    if (this.guestInfoForm.invalid) {
      console.warn('⚠️ Formulario inválido:', this.guestInfoForm.errors);
      this.guestInfoForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Usar getRawValue para obtener campos deshabilitados
    const formData = this.guestInfoForm.getRawValue();
    console.log('📋 Datos del formulario (Raw):', formData);

    // Mapear IDs de ubicación a nombres
    const countryObj = this.countries.find(c => c.id == formData.country);
    const stateObj = this.departments.find(d => d.id == formData.department);
    const cityObj = this.cities.find(c => c.id == formData.city);

    const payload: TouristProfileDto = {
      ...formData,
      country: countryObj ? countryObj.name : formData.country,
      state: stateObj ? stateObj.name : formData.department,
      city: cityObj ? cityObj.name : formData.city,
    };

    if ((payload as any).department) delete (payload as any).department;
    if ((payload as any).photo) delete (payload as any).photo;
    if (payload.photoUrl) delete payload.photoUrl;

    console.log('📤 Payload final para updateProfile:', payload);

    // Si hay una nueva foto, primero actualizamos la foto y luego el perfil
    if (this.selectedFile) {
      console.log('📸 Subiendo nueva foto:', this.selectedFile.name);
      this.touristService.updateProfilePhoto(this.selectedFile).subscribe({
        next: (res) => {
          console.log('✅ Foto de perfil actualizada (200 OK):', res);
          this.executeProfileUpdate(payload, true);
        },
        error: (error) => {
          console.error('❌ Error al actualizar foto:', error);
          this.executeProfileUpdate(payload, false);
        }
      });
    } else {
      console.log('⏭️ Sin foto nueva seleccionada, omitiendo updateProfilePhoto');
      this.executeProfileUpdate(payload, null);
    }
  }

  /**
   * Cierra el modal devolviendo los resultados al componente padre
   */
  private closeModalWithResults(photoSuccess: boolean | null, profileSuccess: boolean) {
    console.log('🏁 Proceso terminado, cerrando modal con resultados:', { photoSuccess, profileSuccess });
    this.loading = false;
    this.dialogRef.close({
      profileSuccess,
      photoSuccess,
      photoAttempted: photoSuccess !== null
    });
  }

  /**
   * Ejecuta la actualización de los datos del perfil
   */
  private executeProfileUpdate(payload: TouristProfileDto, photoSuccess: boolean | null) {
    console.log('👤 Iniciando executeProfileUpdate...');
    this.touristService.updateProfile(payload).subscribe({
      next: (res) => {
        console.log('✅ Perfil actualizado exitosamente (200 OK):', res);
        this.closeModalWithResults(photoSuccess, true);
      },
      error: (error) => {
        console.error('❌ Error al actualizar perfil:', error);
        this.closeModalWithResults(photoSuccess, false);
      }
    });
  }
}

