import { Component, NgZone, OnDestroy, OnInit, Renderer2, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { routes } from "../../shared/routes/routes";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../shared/validators/password-match.validator";
import { AuthService } from "../../core/services/auth.service";
import { Country } from '../../shared/dto/country.dto';
import { Department } from '../../shared/dto/department.dto';
import { City } from '../../shared/dto/city.dto';
import { CountryService } from '../../shared/services/country.service';
import { DepartmentService } from '../../shared/services/department.service';
import { CityService } from '../../shared/services/city.service';
import { ProviderDocumentTypeDto } from '../../shared/dto/provider-document-type.dt';
import { ProviderServiceType, ProviderDocumentType } from '../../shared/enums/provider-document-type.enum';
import { RequestProvidersService } from '../../pages/providers/requestproviders/request-providers.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: "app-register-provider-email",
  standalone: false,
  templateUrl: "./register-provider-email.component.html",
  styleUrl: "./register-provider-email.component.scss",
})
export class RegisterProviderEmailComponent implements OnInit, OnDestroy {
  public routes = routes;

  loading: boolean = false;
  showSuccessModal: boolean = false;
  errorMessage: string = "";
  successMessage: string = "";
  password: boolean[] = [false, false];


  countries: Country[] = [];
  departments: Department[] = [];
  cities: City[] = [];

  documentTypes: ProviderDocumentTypeDto[] = [
    { id: ProviderDocumentType.NIT, description: 'NIT' },
    { id: ProviderDocumentType.RNT, description: 'RNT' },
  ];
  
  serviceTypes: ProviderServiceType[] = [
    ProviderServiceType.TOUR,
    ProviderServiceType.TRANSPORT,
    ProviderServiceType.MEALS_FOOD_BEVERAGE,
    ProviderServiceType.ACCOMMODATION_LODGING
  ];

  registerProviderEmailForm: FormGroup;

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService,
    @Inject(CountryService) private countryService: CountryService,
    @Inject(DepartmentService) private departmentService: DepartmentService,
    @Inject(CityService) private cityService: CityService,
    private requestProviderService: RequestProvidersService
  ) {
    this.registerProviderEmailForm = new FormGroup(
      {
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
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmPassword: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
        // Nuevos campos de empresa
        name: new FormControl("", [Validators.required, Validators.minLength(3)]), 
        documentNumber: new FormControl("", [Validators.required, Validators.minLength(6)]), 
        documentType: new FormControl("", [Validators.required]), 
        serviceType: new FormControl("", [Validators.required]), 
        country: new FormControl("", [Validators.required]), 
        department: new FormControl("", [Validators.required]), 
        city: new FormControl("", [Validators.required]), 
        phone: new FormControl("", [Validators.required, Validators.minLength(10)]), 
        address: new FormControl("", [Validators.required, Validators.minLength(10)]), 
        terms: new FormControl(false, [Validators.requiredTrue]),
      },
      { validators: [passwordMatchValidator("password", "confirmPassword")] }
    );
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, "bg-light-200");
    this.getCountries();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, "bg-light-200");
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
    this.registerProviderEmailForm.get('department')?.setValue("");
    this.registerProviderEmailForm.get('city')?.setValue("");
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
    this.registerProviderEmailForm.get('city')?.setValue("");
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

  submitForm() {
    this.loading = true;
    this.errorMessage = "";
    this.successMessage = "";

    if (this.registerProviderEmailForm.valid) {
      const formData = this.registerProviderEmailForm.value;
      
      // 1. Datos para registro de usuario
      const userData = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password
      };

      // 2. Datos para solicitud de proveedor
      const providerData = {
        "name": formData.name,
        "documentNumber": formData.documentNumber,
        "documentType": formData.documentType,
        "serviceType": formData.serviceType,
        "countryId": +formData.country,
        "stateId": +formData.department,
        "cityId": +formData.city,
        "department": formData.department.toString(),
        "address": formData.address,
        "phone": formData.phone,
        "userEmail": formData.email
      };

      // Ejecutar flujo secuencial
      this.authService.register(userData).pipe(
        switchMap((regResponse: any) => {
          console.log('User registered successfully, proceeding to provider request...');
          return this.requestProviderService.saveRequestProvider(providerData);
        })
      ).subscribe({
        next: (provResponse: any) => {
          this.loading = false;
          this.showSuccessModal = true;
          console.log('Provider request saved successfully.');
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error in unified registration flow:', error);
          if (error?.error?.statusCode === 409) {
            this.errorMessage = "Correo electrónico ya está registrado o hubo un conflicto en la solicitud";
          } else {
            this.errorMessage = "Ha ocurrido un error durante el registro, por favor intente de nuevo.";
          }
        }
      });
    } else {
      this.registerProviderEmailForm.markAllAsTouched();
      this.loading = false;
    }
  }

  closeModal() {
    this.showSuccessModal = false;
    this.router.navigate(["/login"]);
  }
}
