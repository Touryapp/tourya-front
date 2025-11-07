import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourAdminService } from '../../../../shared/services/tour-admin.service';
import { TourAdminDto, TourCategoryDto, ProviderDto } from '../../../../shared/dto/tour-admin.dto';
import { LightGallery } from 'lightgallery/lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';

@Component({
  selector: 'app-tour-admin-detail',
  templateUrl: './tour-admin-detail.component.html',
  styleUrls: ['./tour-admin-detail.component.scss'],
  standalone: false
})
export class TourAdminDetailComponent implements OnInit {
  tour: TourAdminDto | null = null;
  loading: boolean = false;
  showAcceptModal: boolean = false;
  showCancelModal: boolean = false;
  categories: TourCategoryDto[] = [];
  providerDetail: ProviderDto | null = null;

  settings = {
    counter: false,
    plugins: [lgZoom, lgVideo],
  };

  private lightGallery!: LightGallery;

  // Datos de ejemplo para el slider (deberían venir del tour)
  mainSlides = [
    'assets/img/tours/tour-large-01.jpg',
    'assets/img/tours/tour-large-02.jpg',
    'assets/img/tours/tour-large-03.jpg',
  ];

  thumbSlides = [
    'assets/img/tours/tour-thumb-01.jpg',
    'assets/img/tours/tour-thumb-02.jpg',
    'assets/img/tours/tour-thumb-03.jpg',
  ];

  images = [
    { src: 'assets/img/tours/gallery-tour-lg-01.jpg' },
    { src: 'assets/img/tours/gallery-tour-lg-02.jpg' },
    { src: 'assets/img/tours/gallery-tour-lg-03.jpg' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourAdminService: TourAdminService
  ) {}

  ngOnInit(): void {
    const tourId = this.route.snapshot.params['id'];
    if (tourId) {
      // cargar catálogo de categorías y detalle en paralelo
      this.loadCategories();
      this.loadTourDetail(+tourId);
    }
  }

  loadTourDetail(tourId: number): void {
    this.loading = true;
    this.tourAdminService.getById(tourId).subscribe({
      next: (tour) => {
        this.tour = tour;
        // si la respuesta incluye provider con id, intentar cargar detalle del proveedor
        // si no, usar lo que venga embebido en la respuesta (compatibilidad)
        if ((tour as any).provider && (tour as any).provider.id) {
          this.loadProvider((tour as any).provider.id);
        } else if ((tour as any).provider) {
          this.providerDetail = (tour as any).provider;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el tour:', error);
        this.loading = false;
        this.router.navigate(['/admin/tour-admin']);
      }
    });
  }

  loadCategories(): void {
    this.tourAdminService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
      },
      error: (err) => {
        console.error('Error cargando categorias:', err);
      }
    });
  }

  loadProvider(providerId: number): void {
    if (!providerId) return;
    this.tourAdminService.getProviderById(providerId).subscribe({
      next: (prov) => {
        // si el endpoint no devuelve estructura completa, mantenemos null hasta que esté disponible
        this.providerDetail = prov || null;
      },
      error: (err) => {
        console.error('Error cargando proveedor:', err);
        // dejar providerDetail como null si falla
        this.providerDetail = null;
      }
    });
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'Sin categoría';
    // buscar en el catálogo
    const found = this.categories.find(c => c.id === categoryId);
    if (found) return found.name;
    // si el tour incluye objeto tourCategory (compatibilidad), usarlo
    // @ts-ignore
    if ((this.tour as any)?.tourCategory?.name) return (this.tour as any).tourCategory.name;
    return 'Sin categoría';
  }

  openAcceptModal(): void {
    this.showAcceptModal = true;
  }

  closeAcceptModal(): void {
    this.showAcceptModal = false;
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  acceptTour(): void {
    if (this.tour) {
      this.tourAdminService.acceptTour(this.tour.id).subscribe({
        next: () => {
          alert('Tour aceptado exitosamente');
          this.closeAcceptModal();
          this.router.navigate(['/admin/tour-admin']);
        },
        error: (error) => {
          console.error('Error al aceptar el tour:', error);
          alert('Error al aceptar el tour');
        }
      });
    }
  }

  cancelTour(): void {
    if (this.tour) {
      this.tourAdminService.cancelTour(this.tour.id).subscribe({
        next: () => {
          alert('Tour cancelado exitosamente');
          this.closeCancelModal();
          this.router.navigate(['/admin/tour-admin']);
        },
        error: (error) => {
          console.error('Error al cancelar el tour:', error);
          alert('Error al cancelar el tour');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/tour-admin']);
  }

  getStatusBadgeClass(status: string): string {
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'created':
        return 'Creado';
      case 'submitted':
        return 'Enviado';
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

  canAccept(): boolean {
    return this.tour?.status === 'submitted';
  }

  canCancel(): boolean {
    return this.tour?.status === 'submitted';
  }
}
