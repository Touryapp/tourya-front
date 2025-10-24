import { Component, OnInit } from "@angular/core";
import { routes } from "../../../shared/routes/routes";
import { RequestProvider } from "../../../shared/dto/requestProvider-response.dto";
import { RequestProvidersService } from "../requestproviders/request-providers.service";
import { Tour } from "../../../shared/dto/tour-response.dto";
import { TourService } from "../tours/tour.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-provider-panel",
  standalone: false,
  templateUrl: "./provider-panel.component.html",
  styleUrl: "./provider-panel.component.scss",
})
export class ProviderPanelComponent implements OnInit {
  public routes = routes;
  public Math = Math;

  showModal = false;
  showRequestInfoModal = false;
  showConfirmModal = false;
  showDeclineConfirmModal = false;
  selectedProvider: RequestProvider | null = null;
  requestInfoMessage: string = "";
  requestProviders: any = { content: [] };
  mostrarTours: boolean = false;
  mostrarTemplates: boolean = false;
  mostrarTourManagement: boolean = false;
  mostrarReviews: boolean = false;
  mostrarPagos: boolean = false;
  declinedReason: string = "";

  tours: Tour[] = [];
  loading: boolean = false;
  public page: number = 1;
  public size: number = 10;
  public totalItems: number = 0;
  public totalPages: number = 0;
  public currentPage: number = 1;

  constructor(
    private requestProvidersService: RequestProvidersService,
    private toursService: TourService,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const added = !!this.route.snapshot.queryParamMap.get("addedTour");
    const edited = !!this.route.snapshot.queryParamMap.get("editedTour");

    if (added) {
      this.openSnackBar("Tour added successfully");
    } else if (edited) {
      this.openSnackBar("Tour successfully edited");
    }

    this.router.navigate([], { queryParams: null });

    this.getToursProvider();
  }

  getToursProvider() {
    this.toursService
      .getToursProvider({ page: this.page - 1, size: this.size })
      .subscribe({
        next: (response: any) => {
          if (response && response.content) {
            // Respuesta paginada
            this.tours = response.content || [];
            this.totalItems = response.totalElements || 0;
            this.totalPages = response.totalPages || 0;
            this.currentPage = response.number + 1;
          } else if (Array.isArray(response)) {
            // Respuesta como array simple
            this.tours = response;
            this.totalItems = response.length;
            this.totalPages = Math.ceil(response.length / this.size);
            this.currentPage = 1;
          } else {
            // Respuesta vacía o inválida
            this.tours = [];
            this.totalItems = 0;
            this.totalPages = 0;
            this.currentPage = 1;
          }

          this.loading = false;
        },
        error: (error: any) => {
          console.error("=== ERROR EN LA BÚSQUEDA ===");
          console.error("Error al buscar tours:", error);
          console.error("Detalles del error:", error.message);
          this.tours = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.currentPage = 1;
          this.loading = false;
        },
      });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar un rango alrededor de la página actual
      let start = Math.max(
        1,
        this.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      // Ajustar el inicio si estamos cerca del final
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.page = page;
      this.getToursProvider();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }

  onGoToPageFromList(page: number): void {
    this.goToPage(page);
  }

  onGoToPreviousPageFromList(): void {
    this.goToPreviousPage();
  }

  onGoToNextPageFromList(): void {
    this.goToNextPage();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 5000,
    });
  }
}
