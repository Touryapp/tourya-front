import { Component, HostListener, TemplateRef } from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { Router } from "@angular/router";
import { Editor, Toolbar } from "ngx-editor";
import { Category } from "../../../../shared/enums/category.enum";
import { TypeOfAddress } from "../../../../shared/enums/type-of-address.enum";
import { TypeOfPerson } from "../../../../shared/enums/type-of-person.enum";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

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

  editor!: Editor;

  toolbar: Toolbar = [
    ["bold", "italic", "format_clear"],
    ["underline", "strike"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["image"],
  ];

  tabs = [
    { id: "basic_info", label: "Basic Info" },
    { id: "location", label: "Locations" },
    { id: "activities", label: "Main Attractions" },
    { id: "includes", label: "Includes" },
    { id: "excludes", label: "Excludes" },
    { id: "itinerary", label: "Itenary" },
    { id: "faq", label: "FAQ" },
    { id: "gallery", label: "Gallery" },
    { id: "prices", label: "Pricing" },
    { id: "refund", label: "Refund" },
    { id: "description", label: "Description" },
  ];

  activeTab: string = this.tabs[0].id; // Default to the first tab

  readonly Category = Category; // Expose the enum to the template
  readonly TypeOfAddress = TypeOfAddress;
  readonly TypeOfPerson = TypeOfPerson;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalService: BsModalService
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
      highlight: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      typeOfAddress: ["", [Validators.required]],
      country: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      department: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      city: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
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
      mainAttractions: this.fb.array([]),
      includes: this.fb.array([]),
      excludes: this.fb.array([]),
      itinerary: this.fb.array([]),
      faq: this.fb.array([]),
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

    this.addAttraction();
    this.addInclude();
    this.addExclude();
    this.addPrice();
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

    console.log(
      "🚀 ~ AddTourComponent ~ onSubmit ~ this.tourForm:",
      this.tourForm
    );

    if (this.tourForm.valid) {
      console.log(
        "🚀 ~ AddTourComponent ~ onSubmit ~ this.tourForm.valid:",
        this.tourForm.valid
      );
      setTimeout(() => {
        this.loading = false;
      }, 1000);
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
    const typeOfAddressValue = +this.tourForm.get("typeOfAddress")?.value;

    const typeOfAddresses = Object.values(TypeOfAddress).filter(
      (value) => typeof value === "number"
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

  onDurationBlur(event: FocusEvent) {
    this.tourForm
      .get("duration")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onHighlightBlur(event: FocusEvent) {
    this.tourForm
      .get("highlight")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onCountryBlur(event: FocusEvent) {
    this.tourForm
      .get("country")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onDepartmentBlur(event: FocusEvent) {
    this.tourForm
      .get("department")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onCityBlur(event: FocusEvent) {
    this.tourForm
      .get("city")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onLatitudeBlur(event: FocusEvent) {
    this.tourForm
      .get("latitude")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onLongitudeBlur(event: FocusEvent) {
    this.tourForm
      .get("longitude")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onAddressBlur(event: FocusEvent) {
    this.tourForm
      .get("address")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onMainAttractionNameBlur(event: FocusEvent, index: number) {
    this.mainAttractions
      .at(index)
      .get("name")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onIncludeNameBlur(event: FocusEvent, index: number) {
    this.includes
      .at(index)
      .get("name")
      ?.setValue((event.target as HTMLInputElement).value.trim());
  }

  onExcludeNameBlur(event: FocusEvent, index: number) {
    this.excludes
      .at(index)
      .get("name")
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

  onDescriptionBlur(event: any) {
    this.tourForm
      .get("description")
      ?.setValue(this.tourForm.get("description")?.value.trim());
  }

  get mainAttractions(): FormArray {
    return this.tourForm.get("mainAttractions") as FormArray;
  }

  newAttraction(): FormGroup {
    return this.fb.group({
      name: ["", Validators.required],
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
      name: ["", Validators.required],
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
      name: ["", Validators.required],
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

  get itinerary(): FormArray {
    return this.tourForm.get("itinerary") as FormArray;
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
    if (this.itinerary.valid) {
      this.itinerary.push(this.newItinerary());
    }
  }

  removeItinerary(index: number) {
    this.itinerary.removeAt(index);
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

  typeOfPersonIsSelected(typeOfPerson: TypeOfPerson, i: number): boolean {
    const typeOfPersons = this.prices.controls
      .map((control, index) => {
        // Assuming each control in the FormArray is a FormGroup
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
      const index = this.itineraryIndex || this.itinerary.length - 1;

      if (this.itineraryIndex >= 0) {
        this.itineraryIndex = -1;
      } else {
        this.addItinerary();
      }

      this.itinerary.at(index).patchValue(this.itineraryForm.value);

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

  openModal(template: TemplateRef<any>, modal = "", index = -1) {
    switch (modal) {
      case "itinerary": {
        if (index >= 0) {
          this.itineraryIndex = index;
          this.itineraryForm.patchValue(this.itinerary.at(index).value);
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
