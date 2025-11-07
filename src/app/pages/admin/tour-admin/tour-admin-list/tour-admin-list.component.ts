import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TourAdminService } from '../../../../shared/services/tour-admin.service';
import { TourAdminDto, TourStatus, TourCategoryDto } from '../../../../shared/dto/tour-admin.dto';

@Component({
  selector: 'app-tour-admin-list',
  templateUrl: './tour-admin-list.component.html',
  styleUrls: ['./tour-admin-list.component.scss'],
  standalone: false
})
export class TourAdminListComponent implements OnInit {
  @Input() embedMode: boolean = false;
  tours: TourAdminDto[] = [];
  loading: boolean = false;
  
  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  
  // Filtros
  selectedStatus: TourStatus | '' = '';
  statusOptions: { value: TourStatus | '', label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'created', label: 'Creado' },
    { value: 'submitted', label: 'Enviado' },
    { value: 'returned', label: 'Devuelto' },
    { value: 'accepted', label: 'Aceptado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  constructor(
    private tourAdminService: TourAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTours();
  }

  categories: TourCategoryDto[] = [];

  loadCategories(): void {
    this.tourAdminService.getCategories().subscribe({
      next: (cats) => this.categories = cats || [],
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'Sin categoría';
    const found = this.categories.find(c => c.id === categoryId);
    return found ? found.name : 'Sin categoría';
  }

  loadTours(): void {
    this.loading = true;
    const statusParam = this.selectedStatus || undefined;
    
    this.tourAdminService.findAll(this.currentPage, this.pageSize, statusParam).subscribe({
      next: (response) => {
        this.tours = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar tours:', error);
        this.loading = false;
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadTours();
  }

  viewTourDetail(tourId: number): void {
    this.router.navigate(['/admin/tour-admin/detail', tourId]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTours();
    }
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible);
      
      if (end - start < maxVisible) {
        start = Math.max(0, end - maxVisible);
      }
      
      for (let i = start; i < end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
    getMin(a: number, b: number): number {
      return a < b ? a : b;
    }
}
