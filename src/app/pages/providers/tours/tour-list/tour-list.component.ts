import { Component, OnInit } from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { ActivatedRoute, Router } from "@angular/router";
import { OwlOptions } from "ngx-owl-carousel-o";
import { TourService } from "../tour.service";
import { Tour } from "../../../../shared/dto/tour-response.dto";
import { MatSnackBar } from "@angular/material/snack-bar";
import { I18nFieldService } from "../../../../shared/services/i18n-field.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-tour-list",
  standalone: false,

  templateUrl: "./tour-list.component.html",
  styleUrl: "./tour-list.component.scss",
})
export class TourListComponent implements OnInit {
  public routes = routes;
  time: Date | null = null;

  tours: Tour[] = [];
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  // BE-22b: estado del modal "Contacto principal"
  principalModalOpen: boolean = false;
  selectedTourIdForPrincipal: number | null = null;
  selectedTourNameForPrincipal: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tourService: TourService,
    private _snackBar: MatSnackBar,
    public i18nService: I18nFieldService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getTours();
    const added = !!this.route.snapshot.queryParamMap.get("added");
    const edited = !!this.route.snapshot.queryParamMap.get("edited");

    if (added) {
      this.openSnackBar(this.translate.instant('tour-list.snack.tourAdded'));
    } else if (edited) {
      this.openSnackBar(this.translate.instant('tour-list.snack.tourEdited'));
    }

    this.router.navigate([], { queryParams: null });
  }

  isMore: boolean[] = [false];
  value!: number;
  bsValue = new Date();
  startValue = 500;
  endValue = 3000;
  toreset = true;

  public isClassAdded: boolean[] = [false];
  public isSelected: boolean[] = [false];

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value) + "";
    }

    return `${value}`;
  }
  formatLabel1(value: number): string {
    if (value >= 5000) {
      return "$" + Math.round(value / 5000);
    }

    return `$${value}`;
  }

  public imageSlider: OwlOptions = {
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
  };

  toggleClass(index: number) {
    this.isClassAdded[index] = !this.isClassAdded[index];
  }

  /**
   * BE-22b: abre el modal para asignar el operador principal del tour.
   */
  openPrincipalModal(tour: Tour): void {
    this.selectedTourIdForPrincipal = tour.id;
    this.selectedTourNameForPrincipal = this.i18nService.getValue(tour?.name) || '';
    this.principalModalOpen = true;
  }

  closePrincipalModal(): void {
    this.principalModalOpen = false;
    this.selectedTourIdForPrincipal = null;
    this.selectedTourNameForPrincipal = '';
  }

  selectClass(index: number): void {
    this.isSelected[index] = !this.isSelected[index];
  }

  showMore(index: number): void {
    this.isMore[index] = !this.isMore[index];
  }

  getTours() {
    this.tourService
      .getToursProvider({ page: this.page, size: this.size })
      .subscribe({
        next: (data) => {
          if (data && data.content) {
            this.tours = data.content;
            this.totalElements = data.totalElements;
            this.totalPages = data.totalPages;
          } else {
            this.tours = [];
            this.totalElements = 0;
            this.totalPages = 1;
          }
        },
        error: () => {
          this.tours = [];
          this.totalElements = 0;
          this.totalPages = 1;
        },
      });
  }

  displayTourDescription(tour: Tour): any {
    return tour?.description || '';
  }

  displayTourName(tour: Tour): any {
    return tour?.name || '';
  }

  profilePicture(tour: Tour) {
    return tour?.profilePicture?.imageUrl || "assets/img/tours/tours-07.jpg";
  }

  get pages(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }

  setPage(page: number = 0) {
    if (page < 0 || page > this.totalPages) {
      return;
    }

    this.page = page;
    this.getTours();
  }

  nextPage() {
    if (this.page !== this.totalPages) {
      this.setPage(this.page + 1);
    }
  }

  prevPage() {
    if (this.page !== 0) {
      this.setPage(this.page - 1);
    }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 5000,
    });
  }
}
