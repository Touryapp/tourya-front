import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HostListener } from '@angular/core';
import { routes } from "../../../shared/routes/routes";
import { Country } from '../../../shared/dto/country.dto';
import { Department } from '../../../shared/dto/department.dto';
import { City } from '../../../shared/dto/city.dto';
import { CountryService } from '../../../shared/services/country.service';
import { DepartmentService } from '../../../shared/services/department.service';
import { CityService } from '../../../shared/services/city.service';
import { RequestProvidersService } from './request-providers.service';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';

@Component({
  selector: 'app-requestprovider',
  standalone: false,
  templateUrl: './requestprovider.component.html',
  styleUrl: './requestprovider.component.scss'
})
export class RequestproviderComponent implements OnInit {
  requestProviderForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  countries: Country[] = [];
  departments: Department[] = [];
  cities: City[] = [];
  imageUrls: string[] = [];

  public routes = routes;

  tabs = [
    { id: "basic_info", label: "Basic Info" },
    { id: "gallery", label: "Gallery" },
  ];

  activeTab: string = this.tabs[0].id;

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private requestProviderService: RequestProvidersService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getCountries();
  }

  private initializeForm(): void {
    this.requestProviderForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      documentNumber: ['', [Validators.required, Validators.minLength(6)]],
      documentType: ['', [Validators.required]],
      serviceType: ['', [Validators.required]],
      country: ['', [Validators.required]],
      department: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.requestProviderForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const formData = this.requestProviderForm.value;
      console.log('Form Data:', formData);
      const datasaveforprovider = {
        "name": formData.name,
        "documentNumber": formData.documentNumber,
        "documentType": formData.documentType,
        "serviceType": formData.serviceType,
        "countryId": formData.country,
        "stateId": formData.department,
        "cityId": formData.city,
        "department": formData.department,
        "address": formData.address,
        "phone": formData.phone
      }
      console.log('Data to save:', datasaveforprovider);
      // Simular envío de datos
      this.requestProviderService.saveRequestProvider(datasaveforprovider).subscribe({
        next: (data: RequestProvider) => {
          console.log('Data saved:', data);
          this.loading = false;
          this.successMessage = 'Provider request submitted successfully. We will contact you soon.';
          this.requestProviderForm.reset();
        },
        error: (err: any) => {
          console.error('Error saving data:', err);
          this.loading = false;
          this.errorMessage = 'Error saving data. Please try again.';
        }
      });
      // setTimeout(() => {
      //   this.loading = false;
      //   this.successMessage = 'Provider request submitted successfully. We will contact you soon.';
      //   this.requestProviderForm.reset();
      // }, 2000);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  
  @HostListener("window:scroll", [])
  onScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    this.tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) {
        const sectionTop = element.offsetTop - 100;
        const sectionBottom = sectionTop + element.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          this.activeTab = tab.id;
        }
      }
    });
  }

  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      this.activeTab = id;

      setTimeout(() => {
        window.scrollTo(0, element.offsetTop - 75);
      }, 0);
    }
  }

  onCountryChange(value: any) {
    console.log('Country changed:', value);
    this.departments = [];
    this.cities = [];
    this.getDepartments(+value);
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
        console.error("Error getting countries.");
        console.error(err);
        this.countries = [];
      },
    });
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
        console.error("Error getting departments.");
        console.error(err);
        this.departments = [];
      },
    });
  }
  getCities(departmentId: number) {
    this.cityService.getCitiesByDepartmentId(departmentId).subscribe({
      next: (data) => {
        if (data) {
          this.cities = data;
        } else {
          this.cities = [];
        }
      },
      error: (err) => {
        console.error("Error getting cities.");
        console.error(err);
        this.cities = [];
      },
    });
  }
  onDepartmentChange(value: any) {
    this.cities = [];
    this.getCities(+value);
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          // Create a FileReader to read the file as Data URL
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imageUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }
  onDeleteImage(index: number): void {
    this.imageUrls.splice(index, 1);
  }
} 