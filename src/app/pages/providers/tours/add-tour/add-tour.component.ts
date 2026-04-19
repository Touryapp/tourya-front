import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  TemplateRef,
  ViewChildren,
} from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { ActivatedRoute, Router } from "@angular/router";
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
import { MatSnackBar } from "@angular/material/snack-bar";
import { CancellationPolicyType } from "../../../../shared/enums/cancellation-policy-type";
import { I18nFieldService } from "../../../../shared/services/i18n-field.service";
import { PriceType } from "../../../../shared/enums/price-type.enum";
import { SearchToursService } from "../../../clients/list-tours/search-tours.service";
import { TagDto } from "../../../../shared/dto/search-tour-response.dto";


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

  editor!: Editor;

  toolbar: Toolbar = [
    ["bold", "italic", "format_clear"],
    ["underline", "strike"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["image"],
  ];

  tabs = [
    { id: "basic_info", label: "Tour Details" },
    { id: "description", label: "Description" },
    { id: "locations", label: "Locations" },
    { id: "activities", label: "Main Attractions" },
    { id: "includes", label: "Includes" },
    { id: "excludes", label: "Excludes" },
    { id: "itineraries", label: "Itinerary" },
    { id: "faq", label: "FAQ" },
    { id: "cancellationPolicies", label: "Cancellation Policies" },
  ];

  activeTab: string = this.tabs[0].id; // Default to the first tab

  readonly Category = Category;
  readonly TypeOfAddress = TypeOfAddress;
  readonly TypeOfPerson = TypeOfPerson;
  readonly CancellationPolicyType = CancellationPolicyType;
  readonly PriceType = PriceType;


  tourId: number = 0;
  tour: Tour | null = null;

  subcategories: any[] = [];

  scheduleOptions = [
    { value: 'manana', label: 'Mañana' },
    { value: 'tarde', label: 'Tarde' },
    { value: 'noche', label: 'Noche' },
  ];

  submitted: boolean = false;

  countries: Country[] = [];
  departments: Department[][] = [];
  cities: City[][] = [];

  backendCategories: any[] = [];
  tagsList: TagDto[] = [];

  @ViewChildren("addressInput") addressInputs!: QueryList<ElementRef>;

  errorMessage: string = "";
  
  // Propiedades para manejo de estado del tour
  showSubmitConfirmModal: boolean = false;
  isSubmitting: boolean = false;
  // Forzar envío en la siguiente guardada (usar el mismo endpoint de guardado con status 'submitted')
  forceSubmit: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private tourService: TourService,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private i18nService: I18nFieldService,
    private searchToursService: SearchToursService
  ) {
    this.tourId = +(this.route.snapshot.paramMap.get("id") || 0);

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
      subcategory: [""],
      isUnlimited: [false],
      priceType: ["", [Validators.required]],
      duration: [
        "",
        [Validators.required],
      ],
      schedule: [[], [Validators.required]],
      tags: [[]],

      totalNumberOfPeoples: [""], // Initially no validators
      minAge: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      description: ["", [Validators.maxLength(5000)]],
      locations: this.fb.array([]),
      mainAttractions: this.fb.array([]),
      includes: this.fb.array([]),
      excludes: this.fb.array([]),
      itineraries: this.fb.array([]),
      faq: this.fb.array([]),
      cancellationPolicies: this.fb.array([]),
    });

    this.itineraryForm = this.newItinerary();
    this.faqForm = this.newFaq();

    this.addLocation();
    this.addCancellationPolicy();

    this.getCountries();

    // Listen to priceType changes to update totalNumberOfPeoples validation
    this.tourForm.get('priceType')?.valueChanges.subscribe((priceType) => {
      const totalNumberOfPeoplesControl = this.tourForm.get('totalNumberOfPeoples');
      
      if (priceType === PriceType.GROUP) {
        // If GROUP, make totalNumberOfPeoples required
        totalNumberOfPeoplesControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.pattern("^[0-9]*$"),
        ]);
      } else {
        // If INDIVIDUAL, remove validators and clear value
        totalNumberOfPeoplesControl?.clearValidators();
        totalNumberOfPeoplesControl?.setValue('');
      }
      
      totalNumberOfPeoplesControl?.updateValueAndValidity();
    });

    if (this.tourId > 0) {
      this.getTour();
    }
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
    this.submitted = true;
    this.tourForm.markAllAsTouched();

    if (this.tourForm.valid) {
      this.saveTourDetails();
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.getTags();

    this.tourForm.get("category")?.valueChanges.subscribe((value) => {
      if (value) {
        if (!this.isValidCategory) {
          this.tourForm.get("category")?.setValue("");
        }
      }
      this.updateSubcategories();
    });

    this.getCategories();
  }

  getCategories() {
    this.searchToursService.categoriesPublic().subscribe({
      next: (data) => {
        if (data) {
          this.backendCategories = data;
          this.updateSubcategories();
          this.syncCategoryWithSubcategory();
        }
      },
      error: (err) => {
        console.error("Error getting categories", err);
      }
    });
  }

  private syncCategoryWithSubcategory() {
    const subCategoryCode = this.tour?.subCategory || this.tourForm.get('subcategory')?.value;
    const currentCategory = this.tourForm.get('category')?.value;

    if (!currentCategory && subCategoryCode && this.backendCategories.length > 0) {
      const parentCat = this.backendCategories.find(cat => 
        cat.subCategories && cat.subCategories.some((sub: any) => sub.code === subCategoryCode)
      );
      
      if (parentCat) {
        this.tourForm.get('category')?.setValue(parentCat.id, { emitEvent: true });
        this.updateSubcategories();
      }
    }
  }

  getTags() {
    this.searchToursService.tagPublic().subscribe({
      next: (data) => {
        if (data) {
          this.tagsList = data;
        }
      },
      error: (err) => {
        console.error("Error getting tags", err);
      }
    });
  }

  updateSubcategories() {
    const categoryId = this.tourForm.get('category')?.value;
    if (categoryId) {
      const category = this.backendCategories.find(c => c.id === categoryId);
      this.subcategories = category ? (category.subCategories || []) : [];
    } else {
      let allSubcategories: any[] = [];
      this.backendCategories.forEach(cat => {
        if (cat.subCategories) {
          allSubcategories = allSubcategories.concat(cat.subCategories);
        }
      });
      const unique = new Map<string, any>();
      allSubcategories.forEach(sub => unique.set(sub.code, sub));
      this.subcategories = Array.from(unique.values());
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  get isValidCategory(): boolean {
    const categoryValue = +this.tourForm.get("category")?.value;
    const found = this.backendCategories.find((category) => category.id === categoryValue);
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

  onKeyPressTotalNumberOfPeople(event: KeyboardEvent): void {
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

  onNameBlur(event: FocusEvent) {
    this.tourForm
      .get("name")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onCategoryBlur(event: FocusEvent) {}

  isScheduleSelected(value: string): boolean {
    const current: string[] = this.tourForm.get('schedule')?.value || [];
    return current.includes(value);
  }

  onScheduleChange(value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current: string[] = [...(this.tourForm.get('schedule')?.value || [])];
    if (checked) {
      if (!current.includes(value)) current.push(value);
    } else {
      const idx = current.indexOf(value);
      if (idx > -1) current.splice(idx, 1);
    }
    this.tourForm.get('schedule')?.setValue(current);
    this.tourForm.get('schedule')?.markAsDirty();
  }

  isTagSelected(value: number): boolean {
    const current: number[] = this.tourForm.get('tags')?.value || [];
    return current.includes(value);
  }

  onTagChange(value: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current: number[] = [...(this.tourForm.get('tags')?.value || [])];
    if (checked) {
      if (!current.includes(value)) current.push(value);
    } else {
      const idx = current.indexOf(value);
      if (idx > -1) current.splice(idx, 1);
    }
    this.tourForm.get('tags')?.setValue(current);
    this.tourForm.get('tags')?.markAsDirty();
  }

  onTotalNumberOfPeopleBlur(event: FocusEvent) {}

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

  onCancellationPolicyTypeBlur(event: FocusEvent, index: number) {}

  onObservationsBlur(event: FocusEvent, index: number) {
    this.cancellationPolicies
      .at(index)
      .get("observations")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onLocationChange(event: any, index: number) {
    this.locations.at(index).patchValue({
      latitude: null,
      longitude: null,
    });
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
      }, 0);
    } else {
      this.locations.markAllAsTouched();
    }
  }

  removeLocation(index: number) {
    this.locations.removeAt(index);
    this.locations.markAsDirty();
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
    this.mainAttractions.markAsDirty();
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
    this.includes.markAsDirty();
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
    this.excludes.markAsDirty();
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
    this.itineraries.markAsDirty();
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
    this.faq.markAsDirty();
  }

  get cancellationPolicies(): FormArray {
    return this.tourForm.get("cancellationPolicies") as FormArray;
  }

  newCancellationPolicy(): FormGroup {
    return this.fb.group({
      id: [],
      observations: ["", [Validators.maxLength(255)]],
      allowsRainRefund: [false, [Validators.required]],
      allowsRescheduling: [false, [Validators.required]],
      cancellationPolicyType: ["", [Validators.required]],
    });
  }

  addCancellationPolicy() {
    if (
      this.cancellationPolicies.valid &&
      this.cancellationPolicies.length < 1
    ) {
      this.cancellationPolicies.push(this.newCancellationPolicy());
    } else {
      this.cancellationPolicies.markAllAsTouched();
    }
  }

  removeCancellationPolicies(index: number) {
    this.cancellationPolicies.removeAt(index);
    this.cancellationPolicies.markAsDirty();
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
      this.itineraries.at(index).markAsDirty();

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
      this.faq.at(index).markAsDirty();

      this.faqForm.reset();
      this.closeModal();
    }
  }

  saveTourDetails() {
    const {
      name,
      description,
      category,
      subcategory,
      isUnlimited,
      priceType,
      duration,
      schedule,
      tags,
      minAge,
      totalNumberOfPeoples,
      locations,
      mainAttractions,
      includes,
      excludes,
      itineraries,
      faq,
      cancellationPolicies,
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
        location: this.i18nService.createI18nField(location.location),
        addressType: typeOfAddress,
      };
    });

    const modifiedArrayList = this.tourId
      ? {
          updatedLocations: this.locations.dirty,
          updatedMainAttractions: this.mainAttractions.dirty,
          updatedIncludes: this.includes.dirty,
          updatedExcludes: this.excludes.dirty,
          updatedItineraries: this.itineraries.dirty,
          updatedFaq: this.faq.dirty,
          updatedCancellationPolicies: this.cancellationPolicies.dirty,
        }
      : undefined;

    // Determinar el estado a enviar
    let statusToSend = 'created'; // Valor por defecto
    if (this.tourId && this.tour?.status) {
      // Si está en accepted, mantener accepted
      if (this.tour.status === 'accepted') {
        statusToSend = 'accepted';
      }
      // Si está en returned o cancelled, el backend lo cambiará a created
      // y luego lo enviamos a submitted automáticamente
      else if (this.tour.status === 'returned' || this.tour.status === 'cancelled') {
        // Como no existe un endpoint separado para "submit", guardamos directamente como 'submitted'
        statusToSend = 'submitted';
      }
      // Si está en created, mantener created
      else if (this.tour.status === 'created') {
        statusToSend = 'created';
      }
    }

    // Si se forzó el envío desde la acción de "Enviar a revisión", sobreescribimos el status
    if (this.forceSubmit) {
      statusToSend = 'submitted';
    }

    const body = {
      id: this.tourId || undefined,
      name: this.i18nService.createI18nField(name),
      description: this.i18nService.createI18nField(description),
      tourCategoryId: +category,
      priceType: priceType === PriceType.GROUP ? 'grupo' : 'individual',
      durationEnum: Array.isArray(duration) ? duration[0] : duration,
      maxPeople: totalNumberOfPeoples ? +totalNumberOfPeoples : 0,
      isUnlimitedCapacity: isUnlimited,
      subCategory: subcategory,
      timeOfDay: Array.isArray(schedule) ? schedule : schedule ? [schedule] : [],
      tagIds: tags,
      minAge: +minAge,

      locations: locationMap,
      mainAttractions: mainAttractions.map((attr: any) => ({
        id: attr.id,
        description: this.i18nService.createI18nField(attr.description)
      })),
      includes: includes.map((inc: any) => ({
        id: inc.id,
        description: this.i18nService.createI18nField(inc.description),
        type: inc.type
      })),
      excludes: excludes.map((exc: any) => ({
        id: exc.id,
        description: this.i18nService.createI18nField(exc.description),
        type: exc.type
      })),
      faq: faq.map((f: any) => ({
        id: f.id,
        question: this.i18nService.createI18nField(f.question),
        answer: this.i18nService.createI18nField(f.answer)
      })),
      itineraries: itineraries.map((itin: any) => ({
        id: itin.id,
        title: this.i18nService.createI18nField(itin.title),
        day: itin.day,
        time: itin.time,
        description: this.i18nService.createI18nField(itin.description)
      })),
      cancellationPolicies: cancellationPolicies.map((policy: any) => ({
        id: policy.id,
        observations: this.i18nService.createI18nField(policy.observations),
        allowsRainRefund: policy.allowsRainRefund,
        allowsRescheduling: policy.allowsRescheduling,
        cancellationPolicyType: policy.cancellationPolicyType
      })),
      modifiedArrayList,
    };

    this.tourService.saveTourDetails(body).subscribe({
      next: (data) => {
  const wasForceSubmit = this.forceSubmit;
  this.loading = false;
  this.isSubmitting = false;
  // resetear flag
  this.forceSubmit = false;

        if (data) {
          // Si forzamos el submit, navegamos indicando éxito de envío
          if (statusToSend === 'submitted') {
            // Como no existe un endpoint separado para "submit", guardamos directamente como 'submitted'
            statusToSend = 'submitted';
            this.submitTourForReview();
            return;
          }

          // Si debe auto-enviar a revisión (returned o cancelled) usábamos un endpoint separado antes,
          // pero como no existe, el backend debe manejar el flujo; aquí solo navegamos según el caso.
          if (this.tourId) {
            this.router.navigate(["/providers/provider-panel"], {
              queryParams: { editedTour: true },
            });
          } else {
            this.router.navigate(["/providers/provider-panel"], {
              queryParams: { addedTour: true },
            });
          }
        } else {
          this.errorMessage = "Ha ocurrido un error, por favor intente de nuevo";
        }
      },
      error: (err) => {
        this.loading = false;
        console.error("Error saving tour.");
        console.error(err);

        this.errorMessage = "Ha ocurrido un error, por favor intente de nuevo";
      },
    });
  }

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

  getTour() {
    this.tourService.getTourById(this.tourId).subscribe({
      next: (data: Tour) => {
        if (data) {
          this.tour = data;

          // @ts-ignore
          const subCategoryValue = this.tour?.subCategory;
          // @ts-ignore
          const isUnlimitedValue = this.tour?.isUnlimitedCapacity;
          // @ts-ignore
          const durationEnumValue = this.tour?.durationEnum;
          // @ts-ignore
          const timeOfDayValue = this.tour?.timeOfDay;

          this.tourForm.patchValue({
            id: this.tour?.id,
            name: this.i18nService.getValue(this.tour?.name),
            category: this.tour?.tourCategoryId,
            priceType: this.tour?.priceType?.toUpperCase() === 'GRUPO' ? PriceType.GROUP : PriceType.INDIVIDUAL,
            // duration now single-select (string); normalize from array if needed
            duration: Array.isArray(durationEnumValue)
              ? (durationEnumValue[0] || "")
              : durationEnumValue || 
                (Array.isArray(this.tour?.duration) ? this.tour?.duration[0] : this.tour?.duration) || "",
            // schedule now multi-select (array); normalize from string if needed
            schedule: Array.isArray(timeOfDayValue)
              ? timeOfDayValue
              : timeOfDayValue
              ? [timeOfDayValue]
              : [],
            tags: this.tour?.tags ? this.tour.tags.map((t: any) => typeof t === 'object' ? t.id : t) : [],
            subcategory: subCategoryValue || "",
            isUnlimited: isUnlimitedValue || false,
            totalNumberOfPeoples: this.tour?.maxPeople,
            minAge: this.tour?.minAge,
            description: this.i18nService.getValue(this.tour?.description),
          });


          this.tour?.locations?.map((location, index) => {
            if (index >= 1) {
              this.addLocation();
            }

            this.getDepartments(location.countryId, index);
            this.getCities(location.stateId, index);

            this.locations.at(index).patchValue({
              id: location.id,
              typeOfAddress: location.addressType,
              country: location.countryId,
              department: location.stateId,
              city: location.cityId,
              location: this.i18nService.getValue(location.location),
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
            });
          });

          this.tour?.mainAttractions?.map((mainAttraction, index) => {
            this.addAttraction();

            this.mainAttractions.at(index).patchValue({
              id: mainAttraction?.id,
              description: this.i18nService.getValue(mainAttraction?.description),
            });
          });

          this.tour?.includes?.map((include, index) => {
            this.addInclude();

            this.includes.at(index).patchValue({
              id: include?.id,
              description: this.i18nService.getValue(include?.description),
              type: include?.type,
            });
          });

          this.tour?.excludes?.map((exclude, index) => {
            this.addExclude();

            this.excludes.at(index).patchValue({
              id: exclude?.id,
              description: this.i18nService.getValue(exclude?.description),
              type: exclude?.type,
            });
          });

          this.tour?.itineraries?.map((itinerary, index) => {
            this.addItinerary();

            this.itineraries.at(index).patchValue({
              id: itinerary?.id,
              title: this.i18nService.getValue(itinerary?.title),
              day: itinerary?.day,
              time: itinerary?.time,
              description: this.i18nService.getValue(itinerary?.description),
            });
          });

          this.tour?.faq?.map((faq, index) => {
            this.addFaq();

            this.faq.at(index).patchValue({
              id: faq?.id,
              question: this.i18nService.getValue(faq?.question),
              answer: this.i18nService.getValue(faq?.answer),
            });
          });

          this.tour?.cancellationPolicies?.map((cancellationPolicy, index) => {
            this.addCancellationPolicy();

            this.cancellationPolicies.at(index).patchValue({
              id: cancellationPolicy?.id,
              observations: this.i18nService.getValue(cancellationPolicy?.observations),
              allowsRainRefund: cancellationPolicy?.allowsRainRefund,
              allowsRescheduling: cancellationPolicy?.allowsRescheduling,
              cancellationPolicyType:
                cancellationPolicy?.cancellationPolicyType,
            });
          });
          
          this.syncCategoryWithSubcategory();
        } else {
          this.tour = {};
          this.openSnackBar("Error getting tour.");
        }
      },
      error: (err) => {
        console.error("Error getting tour.");
        console.error(err);
        this.openSnackBar("Error getting tour.");
      },
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
        const locationGroup = this.locations.at(index) as FormGroup;
        if (place.geometry) {
          // Extract address components and update the form control
          this.fillAddressFields(locationGroup, place);
        } else {
          locationGroup.patchValue({
            latitude: null,
            longitude: null,
          });
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

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 5000,
    });
  }

  // Métodos para manejo de estado del tour
  get canEdit(): boolean {
    if (!this.tour || !this.tour.status) return true;
    // No se puede editar si está en estado 'submitted'
    return this.tour.status !== 'submitted';
  }

  get canSubmitForReview(): boolean {
    // Solo puede enviar a revisión si está en estado 'created'
    return this.tour?.status === 'created';
  }

  get shouldAutoSubmit(): boolean {
    // Auto-enviar a revisión si está en 'returned' o 'cancelled'
    return this.tour?.status === 'returned' || this.tour?.status === 'cancelled';
  }

  getStatusBadgeClass(status?: string): string {
    if (!status) return 'bg-secondary';
    switch (status) {
      case 'created':
        return 'bg-secondary';
      case 'submitted':
        return 'bg-warning';
      case 'returned':
        return 'bg-info';
      case 'accepted':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Sin estado';
    switch (status) {
      case 'created':
        return 'Creado';
      case 'submitted':
        return 'Enviado a revisión';
      case 'returned':
        return 'Devuelto';
      case 'accepted':
        return 'Aceptado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  openSubmitConfirmModal(): void {
    this.showSubmitConfirmModal = true;
  }

  closeSubmitConfirmModal(): void {
    this.showSubmitConfirmModal = false;
  }

  submitTourForReview(): void {
    // No existe un endpoint separado de "submit" en el backend para el provider.
    // En su lugar forzamos la siguiente guardada a enviar el status 'submitted' usando el mismo endpoint de save.
    if (!this.tourId) return;

    this.closeSubmitConfirmModal();
    this.isSubmitting = true;
    this.forceSubmit = true;

    // Validar y guardar (saveTourDetails respetará `forceSubmit` y enviará status: 'submitted')
    this.tourForm.markAllAsTouched();
    if (this.tourForm.valid) {
      this.tourService.submitTourById(this.tourId).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.openSnackBar('Tour enviado a revisión exitosamente');
          this.router.navigate(["/providers/provider-panel"], {
            queryParams: { submittedTour: true },
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error("Error submitting tour for review.");
          console.error(err);
          this.openSnackBar("Ha ocurrido un error, por favor intente de nuevo");
        },
      });
    } else {
      this.isSubmitting = false;
    }
  }
}

