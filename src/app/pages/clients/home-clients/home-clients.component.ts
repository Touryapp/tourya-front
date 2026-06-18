import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { OwlOptions, CarouselComponent } from 'ngx-owl-carousel-o';
import { routes } from '../../../shared/routes/routes';
// IMPORTS DE SERVICIOS Y DTOS PARA PAÍS, DEPARTAMENTO Y CIUDAD

import { CountryService } from '../../../shared/services/country.service';
import { DepartmentService } from '../../../shared/services/department.service';
import { CityService } from '../../../shared/services/city.service';
import { Country } from '../../../shared/dto/country.dto';
import { Department } from '../../../shared/dto/department.dto';
import { City } from '../../../shared/dto/city.dto';
import { State } from '../../../shared/dto/requestProvider-response.dto';
import { TourCategory } from '../../../shared/dto/tour-response.dto';
import { LocationsPublicDto } from '../../../shared/dto/locations-public.dto';
import { CartService } from '../../../shared/services/cart.service';
import { Subject, takeUntil } from 'rxjs';
import { CartSummary, DaySelection } from '../../../shared/dto/cart.dto';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-home-clients',
  standalone: false,
  
  templateUrl: './home-clients.component.html',
  styleUrl: './home-clients.component.scss'
})
export class HomeClientsComponent {
  public routes =routes;
  time: Date | null = null; // Bind this to the p-calendar
  // Variables para selectores de país, departamento y ciudad
  countries: Country[] = [];
  departments: Department[] = [];

  public states: State[] =  [{id: 1, name: 'Bogota'}];
public categories: TourCategory[] = [
  {
    "id": 1,
    "name": "Categoria 1",
    "description": "Descripcion de la categoria"
  }
]
  locationsPublic: LocationsPublicDto[] = [];
  selectedCountry: number | null = null;
  selectedDepartment: number | null = null;
  selectedState: string = '';
  selectedCity: string = '';
  // Variables para capturar los datos del formulario
  travelDestination: string = '';
  startDate: Date | string = '';
  endDate: Date | string = '';
  // Travellers data
  public travellersData = {
    adults: 2,
    children: 0,
    infants: 0,
    cabinClass: 'Economy'
  };
  public checkIn: string = '';
  public checkOut: string = '';
  public bsRangeValue: Date[] = [new Date(), new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)];

  // Cart properties
  public isCartVisible: boolean = false;
  public cartSummary: CartSummary | null = null;
  public daySelections: DaySelection[] = [];
  private destroy$ = new Subject<void>();

  onDateRangeChange(event: any): void {
    if (Array.isArray(event) && event.length === 2 && event[0] instanceof Date && event[1] instanceof Date) {
      this.bsRangeValue = event as Date[];
      this.updateCheckInCheckOutRange();
    }
  }

  private updateCheckInCheckOutRange(): void {
    if (this.bsRangeValue && this.bsRangeValue.length === 2) {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      this.checkIn = formatDate(this.bsRangeValue[0]);
      this.checkOut = formatDate(this.bsRangeValue[1]);

      // Sincronizar el carrito con las fechas seleccionadas para mostrar el conteo de días correcto
      if (this.cartService) {
        this.cartService.initializeCart(this.checkIn, this.checkOut);
      }
    }
  }

  constructor(
    private router: Router,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private cartService: CartService,
    private translate: TranslateService
  ) {
  }
  bsValue=new Date();
  minDate = new Date();
  isChecked=false;
  isChecked2=false;
  isChecked3=false;
  isChecked4=false;
  isChecked5=false;
  isChecked6=false;
  toreset=true;
  public isClassAdded: boolean[] = [false];
  public isSelected :boolean[]=[false];
public categoriesSlider6 : OwlOptions ={
      loop: true,
      margin: 24,
      nav: false,
      dots: true,
      autoplay: false,
      smartSpeed: 2000,
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 2,
        },
        998: {
          items: 5,
        },
        1200: {
          items: 5,
        },
        1300: {
          items: 5,
        },
        1400: {
          items: 5,
        },
      },
}
public carSlider : OwlOptions={
  loop: false,
    margin: 24,
    nav: false,
    dots: true,
    smartSpeed: 2000,
    autoplay: false,
    navText: [
      "<i class='isax isax-arrow-left-2'></i>",
      "<i class='isax isax-arrow-right-3'></i>",
    ],
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 1,
      },
      769: {
        items: 2,
      },
      993: {
        items: 3,
      },
      1200: {
        items: 4,
      },
      1400: {
        items: 4,
      },
    },
}
public imageSlider : OwlOptions ={
  loop: true,
    margin: 20,
    nav: true,
    dots: true,
    smartSpeed: 2000,
    autoplay: false,
    navText: [
      '<i class="fa-solid fa-chevron-left"></i>',
      '<i class="fa-solid fa-chevron-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 1,
      },
      768: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
}
public providerSlider : OwlOptions={
  loop: true,
      margin: 24,
      nav: false,
      dots: true,
      autoplay: false,
      smartSpeed: 2000,
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 2,
        },
        1300: {
          items: 3,
        },
        1400: {
          items: 4,
        },
      },
}
public clientSlider : OwlOptions ={
  loop: true,
    margin: 24,
    nav: false,
    dots: false,
    autoplay: true,
    smartSpeed: 2000,
    navText: [
      "<i class='fa-solid fa-chevron-left'></i>",
      "<i class='fa-solid fa-chevron-right'></i>",
    ],
    responsive: {
      0: {
        items: 2,
      },
      576: {
        items: 3,
      },
      992: {
        items: 5,
      },
      1200: {
        items: 5,
      },
      1400: {
        items: 7,
      },
    },
}
public bannerSlider: OwlOptions = {
  loop: true,
  margin: 0,
  nav: false,
  dots: true,
  autoplay: true,
  autoplayTimeout: 10000,
  autoplayHoverPause: true,
  autoplaySpeed: 800,
  smartSpeed: 800,
  mouseDrag: true,
  touchDrag: true,
  pullDrag: true,
  animateOut: "fadeOut",
  animateIn: "fadeIn",
  responsive: {
    0: {
      items: 1,
    },
    550: {
      items: 1,
    },
    1200: {
      items: 1,
    },
    1400: {
      items: 1,
    },
  },
};

@ViewChild('bannerCarousel') bannerCarousel!: CarouselComponent;

onCarouselChanged(event: any): void {
  // When user manually changes slide (via dots/drag), we need to
  // explicitly stop and restart autoplay to reset the timer
  if (event.property && event.property.name === 'position') {
    // Check if this was a manual change (not autoplay)
    if (this.bannerCarousel && event.trigger !== 'autoplay') {
      // Stop current autoplay
      this.bannerCarousel.stopAutoplay();
      // Restart autoplay after a brief delay to reset the timer
      setTimeout(() => {
        if (this.bannerCarousel) {
          this.bannerCarousel.startAutoplay();
        }
      }, 100);
    }
  }
}

onSubmit() :void { 
  this.router.navigateByUrl('/hotel/hotel-grid'); 
}
onSubmit2() :void { 
 this.router.navigateByUrl('/flight/flight-grid'); 
}
onSubmit3() :void { 
this.router.navigateByUrl('/car/car-grid'); 
}
onSubmit4() :void { 
this.router.navigateByUrl('/cruise/cruise-grid'); 
}
onSubmit5() :void { 
  localStorage.setItem('travelDestination', this.travelDestination);
  localStorage.setItem('startDate', this.startDate ? this.startDate.toString() : '');
  localStorage.setItem('endDate', this.endDate ? this.endDate.toString() : '');
  this.router.navigateByUrl('/clients/list-tours'); 
} 
onCheck() :void{
  this.isChecked2=false;
  this.isChecked3=false;
}
onCheck2() :void{
  this.isChecked2=true;
  this.isChecked3=false;
}
onCheck3() :void{
  this.isChecked3=true;
  this.isChecked2=false;
}
onCheck4() :void{
  this.isChecked4=true;
  this.isChecked5=false;
  this.isChecked6=false;
}
onCheck5() :void{
  this.isChecked5=true;
  this.isChecked6=false;
  this.isChecked4=false ;
  this.toreset=false;
}
onCheck6() :void{
  this.isChecked4=false;
  this.isChecked6=true;
  this.isChecked5=false;
  this.toreset=false;
}
reset() :void{
  this.isChecked4=false;                                         
  this.isChecked5=false;
  this.isChecked6=false;
  this.toreset=true;
}
  ngOnInit(): void {
    // Set the default time to 10:30 AM
    const defaultTime = new Date();
    defaultTime.setHours(10, 30, 0, 0); // Set hours, minutes, seconds, milliseconds
    this.time = defaultTime;
    // Cargar países al iniciar el componente
    this.getLocationsPublic();
    this.travelDestination = localStorage.getItem('travelDestination') || '';
    this.startDate = localStorage.getItem('startDate') || '';
    this.endDate = localStorage.getItem('endDate') || '';
    // Inicializar checkIn y checkOut desde el principio
    this.updateCheckInCheckOutRange();

    // Inicializar carrito
    this.initCartSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initCartSubscription(): void {
    // Cargar carrito desde el backend (especialmente útil si el usuario acaba de loguearse)
    this.cartService.loadCartFromBackend(true);

    // Suscribirse a los items para determinar visibilidad
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.isCartVisible = items.length > 0;
      });

    // Suscribirse al resumen
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });

    // Suscribirse a los días
    this.cartService.daySelections$
      .pipe(takeUntil(this.destroy$))
      .subscribe(days => {
        this.daySelections = days;
      });
  }

  onFloatingCartClick(): void {
    // Redirigir usando la misma lógica de búsqueda
    this.onSearch();
  }

  onDaySelected(date: string): void {
    console.log('Día seleccionado en el carrito:', date);
    // Podríamos filtrar por fecha si fuera necesario, pero el requerimiento es ir a la lista general
    this.onSearch();
  }

  onCartToggled(isExpanded: boolean): void {
    console.log('Carrito expandido:', isExpanded);
  }

  onCartCleared(): void {
    this.isCartVisible = false;
  }
toggleClass(index: number){
  this.isClassAdded[index] = !this.isClassAdded[index]
}
selectClass(index:number):void{
 this.isSelected[index]=!this.isSelected[index];
}
// Cuando el usuario selecciona un país
onCountryChange(countryId: number) {
  this.selectedCountry = countryId;
  this.departments = [];
  this.states = [];
  this.selectedDepartment = null;
  this.selectedCity = '';
  this.getDepartments(countryId);
}
// Obtener departamentos por país
getDepartments(countryId: number) {
  this.departmentService.getDepartmentsByCountryId(countryId).subscribe({
    next: (data: Department[]) => {
      this.departments = data;
    },
    error: (err: any) => {
      console.error('Error al obtener departamentos', err);
      this.departments = [];
    }
  });
}
// Cuando el usuario selecciona un departamento
// onDepartmentChange(departmentId: number) {
  // this.selectedDepartment = departmentId;
  // this.states = [];
  // this.selectedState = '';
  // this.getCities(departmentId);
// }
// Obtener ciudades por departamento
// getCities(departmentId: number) {
  // this.cityService.getCitiesByDepartmentId(departmentId).subscribe({
    // next: (data: City[]) => {
      // this.states = data.map(state => state.name); // Convertir a string[]
    // },
    // error: (err: any) => {
      // console.error('Error al obtener ciudades', err);
      // this.states = [];
    // }
  // });
// }
// Cuando el usuario selecciona una ciudad
onCityChange(cityName: string) {
  this.selectedCity = cityName;
}
onStartDateChange(date: Date) {
  console.log('Fecha de inicio seleccionada:', date);
  this.startDate = date;
}
onEndDateChange(date: Date) {
  console.log('Fecha de fin seleccionada:', date);
  this.endDate = date;
}

// Methods to update travellers data
updateTravellersCount(type: 'adults' | 'children' | 'infants', count: number): void {
  this.travellersData[type] = Math.max(0, count);
  if (type === 'adults' && this.travellersData.adults < 1) {
    this.travellersData.adults = 1; // At least one adult required
  }
}

updateCabinClass(cabinClass: string): void {
  this.travellersData.cabinClass = cabinClass;
}

getTotalPersons(): number {
  return this.travellersData.adults + this.travellersData.children + this.travellersData.infants;
}

getTravellersDisplay(): string {
  const total = this.getTotalPersons();
  const persons = total === 1 ? 'Person' : 'Persons';
  return `${total} ${persons}`;
}

getTravellersDetails(): string {
  const details = [];
  if (this.travellersData.adults > 0) {
    const adultKey = this.travellersData.adults > 1 ? 'searchComponent.adults' : 'searchComponent.adult';
    details.push(`${this.travellersData.adults} ${this.translate.instant(adultKey)}`);
  }
  if (this.travellersData.children > 0) {
    const childKey = this.travellersData.children > 1 ? 'searchComponent.children' : 'searchComponent.child';
    details.push(`${this.travellersData.children} ${this.translate.instant(childKey)}`);
  }
  if (this.travellersData.infants > 0) {
    const infantKey = this.travellersData.infants > 1 ? 'searchComponent.infants' : 'searchComponent.infant';
    details.push(`${this.travellersData.infants} ${this.translate.instant(infantKey)}`);
  }
  const cabinKey = 'searchComponent.' + (this.travellersData.cabinClass.toLowerCase());
  const translatedCabin = this.translate.instant(cabinKey) !== cabinKey ? this.translate.instant(cabinKey) : this.travellersData.cabinClass;
  return `${details.join(', ')}, ${translatedCabin}`;
}

  // Habilitar búsqueda si al menos un dato está seleccionado
  get isSearchEnabled(): boolean {
    const hasCity = !!this.selectedCity && String(this.selectedCity).trim() !== '';
    const hasCheckIn = !!this.checkIn && String(this.checkIn).trim() !== '';
    const hasCheckOut = !!this.checkOut && String(this.checkOut).trim() !== '';
    return hasCity && hasCheckIn && hasCheckOut;
  }

  onSearch(): void {
    // Asegurar que estén actualizados (aunque ya deberían estarlo por onDateRangeChange)
    this.updateCheckInCheckOutRange();

    // Evitar envío si no hay datos seleccionados
    if (!this.isSearchEnabled) {
      return;
    }

  const userActionsTrace = {
    city: this.selectedCity,
    adults: this.travellersData.adults,
    children: this.travellersData.children,
    infants: this.travellersData.infants,
    cabinClass: this.travellersData.cabinClass,
    checkIn: this.checkIn,
    checkOut: this.checkOut
  };
  localStorage.setItem('userActionsTrace', JSON.stringify(userActionsTrace));

  const params = [
    `city=${encodeURIComponent(this.selectedCity)}`,
    `adults=${encodeURIComponent(this.travellersData.adults)}`,
    `children=${encodeURIComponent(this.travellersData.children)}`,
    `infants=${encodeURIComponent(this.travellersData.infants)}`,
    `cabinClass=${encodeURIComponent(this.travellersData.cabinClass)}`,
    `checkIn=${encodeURIComponent(this.checkIn)}`,
    `checkOut=${encodeURIComponent(this.checkOut)}`
  ].join('&');
  this.router.navigateByUrl(`/clients/list-tours?${params}`);
}

onCategoryClick(subCategory: string, event: Event): void {
  event.preventDefault();
  
  this.updateCheckInCheckOutRange();

  const userActionsTrace = {
    city: this.selectedCity,
    adults: this.travellersData.adults,
    children: this.travellersData.children,
    infants: this.travellersData.infants,
    cabinClass: this.travellersData.cabinClass,
    checkIn: this.checkIn,
    checkOut: this.checkOut
  };
  localStorage.setItem('userActionsTrace', JSON.stringify(userActionsTrace));

  const queryParams: any = {
    subCategory: subCategory
  };

  if (this.selectedCity) queryParams.city = this.selectedCity;
  if (this.travellersData.adults !== undefined) queryParams.adults = this.travellersData.adults;
  if (this.travellersData.children !== undefined) queryParams.children = this.travellersData.children;
  if (this.travellersData.infants !== undefined) queryParams.infants = this.travellersData.infants;
  if (this.travellersData.cabinClass) queryParams.cabinClass = this.travellersData.cabinClass;
  if (this.checkIn) queryParams.checkIn = this.checkIn;
  if (this.checkOut) queryParams.checkOut = this.checkOut;

  this.router.navigate(['/clients/list-tours'], { queryParams });
}

getLocationsPublic(): void {
  this.cityService.getLocationsPublic().subscribe({
    next: (data) => {
      this.locationsPublic = data;
      console.log('Locations Public Data:', data);
      
      // Asignar automáticamente "San Andrés - San Andrés y Providencia"
      const defaultLocation = data.find(l => 
        l.cityName === 'San Andrés' && l.stateName === 'San Andrés y Providencia'
      );
      if (defaultLocation) {
        // Asignamos el ID (convertido a string para coincidir con el tipo de selectedCity)
        this.selectedCity = defaultLocation.cityId.toString();
      }
    },
    error: (err) => {
      console.error('Error fetching locations public data', err);
    }
  });
}

}
