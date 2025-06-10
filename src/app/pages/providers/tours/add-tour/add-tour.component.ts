import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  TemplateRef,
  ViewChildren,
} from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { Router } from "@angular/router";
import { Editor, Toolbar } from "ngx-editor";
import { Category } from "../../../../shared/enums/category.enum";
import { TypeOfAddress } from "../../../../shared/enums/type-of-address.enum";
import { TypeOfPerson } from "../../../../shared/enums/type-of-person.enum";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { TourService } from "../tour.service";
import { Tour } from "../../../../shared/dto/tour-response.dto";
import { CountryService } from "../../../../shared/services/country.service";
import { Country } from "../../../../shared/dto/country.dto";
import { DepartmentService } from "../../../../shared/services/department.service";
import { CityService } from "../../../../shared/services/city.service";
import { Department } from "../../../../shared/dto/department.dto";

import { City } from "../../../../shared/dto/city.dto";

@Component({
  selector: "app-add-tour",
  standalone: false,
  templateUrl: "./add-tour.component.html",
  styleUrl: "./add-tour.component.scss",
})
export class AddTourComponent {
  public routes = routes;

  modalRef?: BsModalRef;

  loading = false;

  tourForm: FormGroup;
  itineraryForm: FormGroup;
  faqForm: FormGroup;

  itineraryIndex: number = -1;
  faqIndex: number = -1;

  imageUrls: string[] = [];
  imageFiles: File[] = [];

  editor!: Editor;

  toolbar: Toolbar = [
    ["bold", "italic", "format_clear"],
    ["underline", "strike"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["image"],
  ];

  tabs = [
    { id: "basic_info", label: "Basic Info" },
    { id: "description", label: "Description" },
    { id: "locations", label: "Locations" },
    { id: "activities", label: "Main Attractions" },
    { id: "includes", label: "Includes" },
    { id: "excludes", label: "Excludes" },
    { id: "itineraries", label: "Itinerary" },
    { id: "faq", label: "FAQ" },
    { id: "galleries", label: "Galleries" },
    { id: "prices", label: "Pricing" },
    { id: "refund", label: "Refund" },
  ];

  activeTab: string = this.tabs[0].id; // Default to the first tab

  readonly Category = Category;
  readonly TypeOfAddress = TypeOfAddress;
  readonly TypeOfPerson = TypeOfPerson;

  tourId: number = 0;
  tour: Tour | null = null;

  countries: Country[] = [];
  departments: Department[][] = [];
  cities: City[][] = [];

  @ViewChildren("addressInput") addressInputs!: QueryList<ElementRef>;

  errorMessage: string = "";

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private tourService: TourService,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService
  ) {
    this.tourForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      category: ["", [Validators.required]],
      duration: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      totalNumberOfPeoples: [
        "",
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      price: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      minAge: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      locations: this.fb.array([]),
      mainAttractions: this.fb.array([]),
      includes: this.fb.array([]),
      excludes: this.fb.array([]),
      itineraries: this.fb.array([]),
      faq: this.fb.array([]),
      galleries: this.fb.array([]),
      prices: this.fb.array([]),
      fullRefundHoursBefore: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      partialRefundHoursBefore: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      partialRefundPercentage: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      allowsWeatherReimbursement: [false, [Validators.required]],
      otherConditions: ["", [Validators.maxLength(255)]],
      description: ["", [Validators.required, Validators.maxLength(5000)]],
    });

    this.itineraryForm = this.newItinerary();
    this.faqForm = this.newFaq();

    this.addLocation();
    this.addAttraction();
    this.addInclude();
    this.addExclude();
    this.addPrice();

    this.getCountries();
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    this.tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) {
        const sectionTop = element.offsetTop - 100; // Adjust offset for fixed headers
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

      this.activeTab = id; // Update the active tab

      setTimeout(() => {
        window.scrollTo(0, element.offsetTop - 75);
      }, 0);
    }
  }

  formData: any[] = []; // Initialize with an empty object to start with one row

  addNewRow() {
    this.formData.push({});
  }

  removeRow(index: number) {
    this.formData.splice(index, 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  trackByIndex(index: number, item: any) {
    return index;
  }

  onSubmit() {
    this.loading = true;
    this.tourForm.markAllAsTouched();

    if (this.tourForm.valid) {
      if (this.tourId > 0) {
        this.updateTour();
      } else {
        this.saveTourDetails();
      }
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.editor = new Editor();

    this.tourForm.get("category")?.valueChanges.subscribe((value) => {
      if (value) {
        if (!this.isValidCategory) {
          this.tourForm.get("category")?.setValue("");
        }
      }
    });

    this.tourForm.get("typeOfAddress")?.valueChanges.subscribe((value) => {
      if (value) {
        if (!this.isValidTypeOfAddress) {
          this.tourForm.get("typeOfAddress")?.setValue("");
        }
      }
    });

    this.prices.valueChanges.subscribe((value) => {
      if (value.length > 0) {
        this.prices.controls.forEach((control, index) => {
          control.get("typeOfPerson")?.valueChanges.subscribe((value) => {
            if (value) {
              if (!this.isValidTypeOfPerson(index)) {
                control.get("typeOfPerson")?.setValue("");
              }
            }
          });
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  get isValidCategory(): boolean {
    const categoryValue = +this.tourForm.get("category")?.value;

    const categories = Object.values(Category).filter(
      (value) => typeof value === "number"
    );

    const found = categories.find((category) => category === categoryValue);

    return !!found;
  }

  get isValidTypeOfAddress(): boolean {
    const typeOfAddressValue = this.tourForm.get("typeOfAddress")?.value;

    const typeOfAddresses = Object.values(TypeOfAddress).filter(
      (value) => typeof value === "string"
    );

    const found = typeOfAddresses.find(
      (typeOfAddress) => typeOfAddress === typeOfAddressValue
    );

    return !!found;
  }

  isValidTypeOfPerson(index: number): boolean {
    const typeOfPersonValue = +this.prices.at(index).get("typeOfPerson")?.value;

    const typesOfPeople = Object.values(TypeOfPerson).filter(
      (value) => typeof value === "number"
    );

    const found = typesOfPeople.find(
      (typeOfPerson) => typeOfPerson === typeOfPersonValue
    );

    return !!found;
  }

  onKeyPressTotalNumberOfPeople(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressPrice(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressMinAge(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressDay(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressPriceMinAge(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressPriceMaxAge(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressFullRefundHoursBefore(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressPartialRefundHoursBefore(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onKeyPressPartialRefundPercentage(event: KeyboardEvent): void {
    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onNameBlur(event: FocusEvent) {
    this.tourForm
      .get("name")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onCategoryBlur(event: FocusEvent) {}

  onDurationBlur(event: FocusEvent) {
    this.tourForm
      .get("duration")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onTotalNumberOfPeopleBlur(event: FocusEvent) {}

  onPriceBlur(event: FocusEvent) {}

  onMinAgeBlur(event: FocusEvent) {}

  onDescriptionBlur(event: any) {
    this.tourForm
      .get("description")
      ?.setValue(this.tourForm.get("description")?.value.trim());
  }

  onCountryChange(value: any, index: number) {
    this.departments[index] = [];
    this.cities[index] = [];
    this.getDepartments(+value, index);
  }

  onCountryBlur(event: FocusEvent, index: number) {
    this.locations
      .at(index)
      .get("country")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onDepartmentChange(value: any, index: number) {
    this.cities[index] = [];
    this.getCities(+value, index);
  }

  onDepartmentBlur(event: FocusEvent, index: number) {
    this.locations
      .at(index)
      .get("department")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onCityBlur(event: FocusEvent, index: number) {
    this.locations
      .at(index)
      .get("city")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onLatitudeBlur(event: FocusEvent, index: number) {
    this.locations
      .at(index)
      .get("latitude")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onLongitudeBlur(event: FocusEvent, index: number) {
    this.locations
      .at(index)
      .get("longitude")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onAddressBlur(event: FocusEvent, index: number) {
    this.locations
      .at(index)
      .get("address")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onMainAttractionDescriptionBlur(event: FocusEvent, index: number) {
    this.mainAttractions
      .at(index)
      .get("description")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onIncludeDescriptionBlur(event: FocusEvent, index: number) {
    this.includes
      .at(index)
      .get("description")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onExcludeDescriptionBlur(event: FocusEvent, index: number) {
    this.excludes
      .at(index)
      .get("description")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onItineraryTitleBlur(event: FocusEvent) {
    this.itineraryForm
      .get("title")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onItineraryDescriptionBlur(event: FocusEvent) {
    this.itineraryForm
      .get("description")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onQuestionBlur(event: FocusEvent) {
    this.faqForm
      .get("question")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onAnswerBlur(event: FocusEvent) {
    this.faqForm
      .get("answer")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onOtherConditionsBlur(event: FocusEvent) {
    this.tourForm
      .get("otherConditions")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  get locations(): FormArray {
    return this.tourForm.get("locations") as FormArray;
  }

  newLocation(): FormGroup {
    return this.fb.group({
      typeOfAddress: ["", [Validators.required]],
      country: ["", [Validators.required]],
      department: ["", [Validators.required]],
      city: ["", [Validators.required]],
      location: ["", [Validators.required]],
      latitude: [
        "",
        [
          Validators.required,
          Validators.pattern("^-?([0-8]?[0-9]|90)(.[0-9]{1,10})$"),
        ],
      ],
      longitude: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "^-?(?:180(?:\\.0+)?|(?:1[0-7]\\d|\\d{1,2})(?:\\.\\d+)?)$"
          ),
        ],
      ],
      address: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
    });
  }

  addLocation() {
    if (this.locations.valid) {
      this.locations.push(this.newLocation());
      setTimeout(() => {
        this.initAutocomplete(this.locations.length - 1);
      }, 0); // U
    } else {
      this.locations.markAllAsTouched();
    }
  }

  removeLocation(index: number) {
    this.locations.removeAt(index);
  }

  get mainAttractions(): FormArray {
    return this.tourForm.get("mainAttractions") as FormArray;
  }

  newAttraction(): FormGroup {
    return this.fb.group({
      description: ["", Validators.required],
    });
  }

  addAttraction() {
    if (this.mainAttractions.valid) {
      this.mainAttractions.push(this.newAttraction());
    } else {
      this.mainAttractions.markAllAsTouched();
    }
  }

  removeAttraction(index: number) {
    this.mainAttractions.removeAt(index);
  }

  get includes(): FormArray {
    return this.tourForm.get("includes") as FormArray;
  }

  newInclude(): FormGroup {
    return this.fb.group({
      description: ["", Validators.required],
      type: ["Include", Validators.required],
    });
  }

  addInclude() {
    if (this.includes.valid) {
      this.includes.push(this.newInclude());
    } else {
      this.includes.markAllAsTouched();
    }
  }

  removeInclude(index: number) {
    this.includes.removeAt(index);
  }

  get excludes(): FormArray {
    return this.tourForm.get("excludes") as FormArray;
  }

  newExclude(): FormGroup {
    return this.fb.group({
      description: ["", Validators.required],
      type: ["Exclude", Validators.required],
    });
  }

  addExclude() {
    if (this.excludes.valid) {
      this.excludes.push(this.newExclude());
    } else {
      this.excludes.markAllAsTouched();
    }
  }

  removeExclude(index: number) {
    this.excludes.removeAt(index);
  }

  get itineraries(): FormArray {
    return this.tourForm.get("itineraries") as FormArray;
  }

  newItinerary(): FormGroup {
    return this.fb.group({
      title: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      day: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      time: ["", [Validators.required]],
      description: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
    });
  }

  addItinerary() {
    if (this.itineraries.valid) {
      this.itineraries.push(this.newItinerary());
    }
  }

  removeItinerary(index: number) {
    this.itineraries.removeAt(index);
  }

  get faq(): FormArray {
    return this.tourForm.get("faq") as FormArray;
  }

  newFaq(): FormGroup {
    return this.fb.group({
      question: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      answer: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
    });
  }

  addFaq() {
    if (this.faq.valid) {
      this.faq.push(this.newFaq());
    }
  }

  removeFaq(index: number) {
    this.faq.removeAt(index);
  }

  get prices(): FormArray {
    return this.tourForm.get("prices") as FormArray;
  }

  newPrice(): FormGroup {
    return this.fb.group({
      typeOfPerson: ["", [Validators.required]],
      minAge: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      maxAge: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      price: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
    });
  }

  addPrice() {
    if (this.prices.valid && this.prices.length < 3) {
      this.prices.push(this.newPrice());
    } else {
      this.prices.markAllAsTouched();
    }
  }

  removePrice(index: number) {
    this.prices.removeAt(index);
  }

  get galleries(): FormArray {
    return this.tourForm.get("galleries") as FormArray;
  }

  newGallery(): FormGroup {
    return this.fb.group({
      id: [],
      // imageUrl: ["", [Validators.required]],
      description: ["", [Validators.required]],
      orderIndex: ["", [Validators.required]],
    });
  }

  addGallery() {
    if (this.galleries.valid) {
      this.galleries.push(this.newGallery());
    }
  }

  removeGallery(index: number) {
    this.galleries.removeAt(index);
  }

  typeOfAddressIsSelected(typeOfAddress: TypeOfAddress, i: number): boolean {
    const typeOfAddresses = this.locations.controls
      .map((control, index) => {
        if (index !== i) {
          return (control as FormGroup).get("typeOfAddress")?.value;
        }
      })
      .filter((v) => v);

    return typeOfAddresses.includes(typeOfAddress);
  }

  typeOfPersonIsSelected(typeOfPerson: TypeOfPerson, i: number): boolean {
    const typeOfPersons = this.prices.controls
      .map((control, index) => {
        if (index !== i) {
          return (control as FormGroup).get("typeOfPerson")?.value;
        }
      })
      .filter((v) => v);

    return typeOfPersons.includes(typeOfPerson);
  }

  onSubmitItinerary(): void {
    this.itineraryForm.markAllAsTouched();

    if (this.itineraryForm.valid) {
      const index = this.itineraryIndex || this.itineraries.length - 1;

      if (this.itineraryIndex >= 0) {
        this.itineraryIndex = -1;
      } else {
        this.addItinerary();
      }

      this.itineraries.at(index).patchValue(this.itineraryForm.value);

      this.itineraryForm.reset();
      this.closeModal();
    }
  }

  onSubmitFaq(): void {
    this.faqForm.markAllAsTouched();

    if (this.faqForm.valid) {
      const index = this.faqIndex || this.faq.length - 1;

      if (this.faqIndex >= 0) {
        this.faqIndex = -1;
      } else {
        this.addFaq();
      }

      this.faq.at(index).patchValue(this.faqForm.value);

      this.faqForm.reset();
      this.closeModal();
    }
  }

  saveTourDetails() {
    const {
      name,
      description,
      category,
      duration,
      price,
      minAge,
      totalNumberOfPeoples,
      locations,
      mainAttractions,
      includes,
      excludes,
      itineraries,
      faq,
      prices,
      galleries,
    } = this.tourForm.value;

    const locationMap = locations.map((location: any) => {
      const {
        typeOfAddress,
        country,
        department,
        city,
        latitude,
        longitude,
        address,
      } = location;

      return {
        countryId: +country,
        stateId: +department,
        cityId: +city,
        latitude: +latitude,
        longitude: +longitude,
        address,
        location: location.location,
        addressType: typeOfAddress,
      };
    });

    const body = {
      name,
      description,
      tourCategoryId: +category,
      duration,
      maxPeople: totalNumberOfPeoples,
      price: +price,
      minAge: +minAge,
      locations: locationMap,
      mainAttractions,
      includes,
      excludes,
      faq,
      itineraries,
      galleries,
    };

    this.tourService.saveTourDetails(this.imageFiles, body).subscribe({
      next: (data) => {
        this.loading = false;

        if (data) {
          this.router.navigate([routes.tourList], {
            queryParams: { added: true },
          });
        }

        this.errorMessage = "Ha ocurrido un error, por favor intente de nuevo";
      },
      error: (err) => {
        this.loading = false;
        console.error("Error saving tour.");
        console.error(err);

        this.errorMessage = "Ha ocurrido un error, por favor intente de nuevo";
      },
    });
  }

  updateTour() {}

  getCountries() {
    this.countryService.getCountries().subscribe({
      next: (data) => {
        if (data) {
          this.countries = data;
        } else {
          this.countries = [];
        }
      },
      error: (err) => {
        console.error("Error getting countries.");
        console.error(err);
        this.countries = [];
      },
    });
  }

  getDepartments(countryId: number, index: number) {
    this.departmentService.getDepartmentsByCountryId(countryId).subscribe({
      next: (data) => {
        if (data) {
          this.departments[index] = data;
        } else {
          this.departments[index] = [];
        }
      },
      error: (err) => {
        console.error("Error getting departments.");
        console.error(err);
        this.departments[index] = [];
      },
    });
  }

  getCities(departmentId: number, index: number) {
    this.cityService.getCitiesByDepartmentId(departmentId).subscribe({
      next: (data) => {
        if (data) {
          this.cities[index] = data;
        } else {
          this.cities[index] = [];
        }
      },
      error: (err) => {
        console.error("Error getting cities.");
        console.error(err);
        this.cities[index] = [];
      },
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          // Store the actual file for upload
          this.imageFiles.push(file);
          
          // Create a FileReader to read the file as Data URL for preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imageUrls.push(e.target.result);

            this.addGallery();

            this.galleries.at(this.galleries.length - 1).patchValue({
              // imageUrl: e.target.result,
              orderIndex: this.galleries.length,
              description: file.name,
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  onDeleteImage(index: number): void {
    this.imageUrls.splice(index, 1);
    this.imageFiles.splice(index, 1);
    this.galleries.removeAt(index);

    this.galleries.controls.forEach((control, i) => {
      control.patchValue({
        orderIndex: i + 1,
      });
    });
  }

  initAutocomplete(index: number): void {
    // Find the specific input element for the current address index
    const inputElement = this.addressInputs.toArray()[index].nativeElement;

    if (inputElement && google && google.maps && google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(inputElement, {
        types: ["address"], // Restrict to address predictions
        componentRestrictions: { country: ["COL"] }, // Optional: Restrict to a specific country
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          // Extract address components and update the form control
          const locationGroup = this.locations.at(index) as FormGroup;
          this.fillAddressFields(locationGroup, place);
        } else {
          // Handle case where place.geometry is not available (e.g., user types a non-place)
          console.warn("No geometry for selected place:", place);
        }
      });
    }
  }

  fillAddressFields(locationGroup: FormGroup, place: any): void {
    // Reset all address fields
    locationGroup.patchValue({
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    });
  }

  openModal(template: TemplateRef<any>, modal = "", index = -1) {
    switch (modal) {
      case "itinerary": {
        if (index >= 0) {
          this.itineraryIndex = index;
          this.itineraryForm.patchValue(this.itineraries.at(index).value);
        }
        break;
      }

      case "faq": {
        if (index >= 0) {
          this.faqIndex = index;
          this.faqForm.patchValue(this.faq.at(index).value);
        }
        break;
      }

      default:
        break;
    }

    this.modalRef = this.modalService.show(template);
  }

  closeModal(): void {
    this.itineraryForm.reset();
    this.faqForm.reset();
    this.modalRef?.hide();
  }
}
